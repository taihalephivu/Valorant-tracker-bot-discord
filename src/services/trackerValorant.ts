import { AxiosInstance } from 'axios';
import { getAxiosInstance } from './axiosClient';

export interface PlayerProfile {
  platformInfo: {
    platformSlug: string;
    platformUserId: string;
    platformUserHandle: string;
    avatarUrl?: string;
  };
  userInfo: {
    userId: string;
    isPremium: boolean;
    isVerified: boolean;
    isInfluencer: boolean;
    isPartner: boolean;
    countryCode?: string;
  };
  segments: Array<{
    type: string;
    attributes: any;
    metadata: any;
    expiryDate: string;
    stats: {
      [key: string]: {
        displayName: string;
        displayCategory: string;
        category: string;
        metadata?: any;
        value: number | string;
        displayValue: string;
        displayType: string;
      };
    };
  }>;
}

export interface LiveMatch {
  matches?: Array<any>;
}

export class TrackerValorantService {
  private axiosInstance: AxiosInstance;

  constructor(apiKey?: string) {
    this.axiosInstance = getAxiosInstance(apiKey);
  }

  async getPlayerProfile(gameName: string, tag: string, region?: string): Promise<PlayerProfile> {
    try {
      const regionCode = region || 'ap';
      
      // Thêm timeout wrapper để đảm bảo không treo quá lâu
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timeout sau 20s')), 20000);
      });
      
      // Parallel API calls để nhanh hơn
      const apiCallsPromise = Promise.allSettled([
        this.axiosInstance.get(`/v1/account/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`),
        this.axiosInstance.get(`/v2/mmr/${regionCode}/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`),
        this.axiosInstance.get(`/v3/matches/${regionCode}/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`, {
          params: { size: 5 } // Giảm từ 10 → 5 để tiết kiệm RAM
        })
      ]);
      
      const [accountResponse, mmrResponse, matchesResponse] = await Promise.race([
        apiCallsPromise,
        timeoutPromise
      ]) as PromiseSettledResult<any>[];

      // Check account
      if (accountResponse.status === 'rejected' || accountResponse.value.data.status !== 200) {
        const errorMsg = accountResponse.status === 'rejected' 
          ? accountResponse.reason?.message 
          : accountResponse.value.data.message || 'Unknown error';
        throw new Error(`Không tìm thấy người chơi: ${gameName}#${tag}`);
      }
      const accountData = accountResponse.value.data.data;

      // Get MMR data
      let mmrData: any = null;
      if (mmrResponse.status === 'fulfilled' && mmrResponse.value.data.status === 200) {
        mmrData = mmrResponse.value.data.data;
      }

      // Calculate stats from matches
      let matchStats: any = null;
      if (matchesResponse.status === 'fulfilled' && matchesResponse.value.data.status === 200) {
        const matchesData = matchesResponse.value.data.data;
        if (matchesData && matchesData.length > 0) {
          matchStats = this.calculateStats(matchesData, accountData.puuid);
        }
      }
      
      // Nếu không có matchStats, báo lỗi rõ ràng
      if (!matchStats) {
        throw new Error(`Không tìm thấy dữ liệu trận đấu của **${gameName}#${tag}**\n\nCó thể do:\n• Chưa chơi trận nào gần đây\n• Profile ở chế độ private\n• API không trả về dữ liệu`);
      }

      // Build response
      const profile: PlayerProfile = {
        platformInfo: {
          platformSlug: 'riot',
          platformUserId: accountData.puuid,
          platformUserHandle: `${accountData.name}#${accountData.tag}`,
          avatarUrl: accountData.card?.small
        },
        userInfo: {
          userId: accountData.puuid,
          isPremium: false,
          isVerified: false,
          isInfluencer: false,
          isPartner: false,
          countryCode: accountData.region
        },
        segments: []
      };

      const stats: any = {};

      // Add rank
      if (mmrData?.current_data) {
        const current = mmrData.current_data;
        stats.rank = {
          displayName: 'Rank',
          displayCategory: 'Performance',
          category: 'performance',
          value: current.currenttier || 0,
          displayValue: current.currenttierpatched || 'Unranked',
          displayType: 'string',
          metadata: {
            tierName: current.currenttierpatched || 'Unranked',
            iconUrl: this.getRankIconUrl(current.currenttier)
          }
        };

        if (current.ranking_in_tier !== undefined) {
          stats.rankRating = {
            displayName: 'RR',
            displayCategory: 'Performance',
            category: 'performance',
            value: current.ranking_in_tier,
            displayValue: `${current.ranking_in_tier} RR`,
            displayType: 'string'
          };
        }
      }

      // Add match stats
      if (matchStats) {
        stats.kDRatio = {
          displayName: 'K/D Ratio',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.kd,
          displayValue: matchStats.kd.toFixed(2),
          displayType: 'number'
        };

        stats.headshotsPercentage = {
          displayName: 'Headshot %',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.hsPercent,
          displayValue: `${matchStats.hsPercent.toFixed(1)}%`,
          displayType: 'percentage'
        };

        stats.matchesWon = {
          displayName: 'Wins',
          displayCategory: 'Performance',
          category: 'performance',
          value: matchStats.wins,
          displayValue: matchStats.wins.toString(),
          displayType: 'number'
        };

        stats.matchesLost = {
          displayName: 'Losses',
          displayCategory: 'Performance',
          category: 'performance',
          value: matchStats.losses,
          displayValue: matchStats.losses.toString(),
          displayType: 'number'
        };

        stats.matchesWinPct = {
          displayName: 'Win Rate',
          displayCategory: 'Performance',
          category: 'performance',
          value: matchStats.winRate,
          displayValue: `${matchStats.winRate.toFixed(1)}%`,
          displayType: 'percentage'
        };

        stats.kills = {
          displayName: 'Kills',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.kills,
          displayValue: matchStats.kills.toString(),
          displayType: 'number'
        };

        stats.deaths = {
          displayName: 'Deaths',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.deaths,
          displayValue: matchStats.deaths.toString(),
          displayType: 'number'
        };

        stats.assists = {
          displayName: 'Assists',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.assists,
          displayValue: matchStats.assists.toString(),
          displayType: 'number'
        };

        stats.scorePerMatch = {
          displayName: 'Score/Match',
          displayCategory: 'Performance',
          category: 'performance',
          value: matchStats.avgScore,
          displayValue: Math.round(matchStats.avgScore).toString(),
          displayType: 'number'
        };

        stats.damagePerRound = {
          displayName: 'Damage/Round',
          displayCategory: 'Combat',
          category: 'combat',
          value: matchStats.avgDamage,
          displayValue: Math.round(matchStats.avgDamage).toString(),
          displayType: 'number'
        };

        stats.timePlayed = {
          displayName: 'Matches',
          displayCategory: 'Performance',
          category: 'performance',
          value: matchStats.totalMatches,
          displayValue: `${matchStats.totalMatches} matches`,
          displayType: 'string'
        };
      }

      profile.segments.push({
        type: 'overview',
        attributes: {},
        metadata: {},
        expiryDate: new Date().toISOString(),
        stats
      });

      return profile;

    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) throw new Error(`Không tìm thấy người chơi: ${gameName}#${tag}`);
      if (status === 429) throw new Error('API rate limit. Thử lại sau.');
      if (status === 401) throw new Error('API key không hợp lệ.');
      throw new Error(error.message || 'Lỗi khi lấy dữ liệu');
    }
  }

  private calculateStats(matches: any[], puuid: string) {
    // Sử dụng reduce thay vì multiple loops để tối ưu performance
    const stats = matches.reduce((acc, match) => {
      const player = match.players.all_players?.find((p: any) => p.puuid === puuid);
      if (!player) return acc;

      const s = player.stats;
      acc.kills += s.kills || 0;
      acc.deaths += s.deaths || 0;
      acc.assists += s.assists || 0;
      acc.headshots += s.headshots || 0;
      acc.bodyshots += s.bodyshots || 0;
      acc.legshots += s.legshots || 0;
      
      // Henrik API v3 structure: damage là object với nhiều field
      const damageValue = s.damage?.made || s.damage_made || player.damage_made || 0;
      acc.totalDamage += damageValue;
      acc.totalScore += s.score || 0;
      
      // Đếm số rounds để tính damage per round chính xác hơn
      const rounds = match.metadata?.rounds_played || 0;
      acc.totalRounds += rounds;

      const team = player.team?.toLowerCase();
      if (match.teams?.[team]?.has_won) acc.wins++;
      else acc.losses++;

      return acc;
    }, {
      kills: 0, deaths: 0, assists: 0, headshots: 0, bodyshots: 0, legshots: 0,
      totalDamage: 0, totalScore: 0, totalRounds: 0, wins: 0, losses: 0
    });

    const totalShots = stats.headshots + stats.bodyshots + stats.legshots;
    const totalMatches = stats.wins + stats.losses;

    return {
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      kd: stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills,
      hsPercent: totalShots > 0 ? (stats.headshots / totalShots) * 100 : 0,
      wins: stats.wins,
      losses: stats.losses,
      winRate: totalMatches > 0 ? (stats.wins / totalMatches) * 100 : 0,
      avgScore: totalMatches > 0 ? stats.totalScore / totalMatches : 0,
      avgDamage: stats.totalRounds > 0 ? stats.totalDamage / stats.totalRounds : 0,
      totalMatches
    };
  }

  async getLiveMatch(gameName: string, tag: string, region?: string): Promise<LiveMatch | null> {
    try {
      const regionCode = region || 'ap';
      const response = await this.axiosInstance.get(`/v3/matches/${regionCode}/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`, {
        params: { size: 1 }
      });

      if (response.data.status === 200 && response.data.data?.length > 0) {
        return { matches: response.data.data };
      }
      
      return null;
    } catch (error: any) {
      return null;
    }
  }

  async getMMRHistory(gameName: string, tag: string, region?: string, size: number = 10): Promise<any[]> {
    try {
      const regionCode = region || 'ap';
      const response = await this.axiosInstance.get(`/v1/mmr-history/${regionCode}/${encodeURIComponent(gameName)}/${encodeURIComponent(tag)}`);

      if (response.data.status === 200 && response.data.data) {
        const matches = response.data.data;
        return matches.slice(0, size);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  getRankName(rankValue?: number): string {
    const ranks: any = {
      3: 'Iron 1', 4: 'Iron 2', 5: 'Iron 3',
      6: 'Bronze 1', 7: 'Bronze 2', 8: 'Bronze 3',
      9: 'Silver 1', 10: 'Silver 2', 11: 'Silver 3',
      12: 'Gold 1', 13: 'Gold 2', 14: 'Gold 3',
      15: 'Platinum 1', 16: 'Platinum 2', 17: 'Platinum 3',
      18: 'Diamond 1', 19: 'Diamond 2', 20: 'Diamond 3',
      21: 'Ascendant 1', 22: 'Ascendant 2', 23: 'Ascendant 3',
      24: 'Immortal 1', 25: 'Immortal 2', 26: 'Immortal 3',
      27: 'Radiant'
    };
    return ranks[rankValue || 0] || 'Unranked';
  }

  getRankIconUrl(rankValue?: number): string {
    if (!rankValue || rankValue < 3) {
      return 'https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/0.png';
    }
    return `https://trackercdn.com/cdn/tracker.gg/valorant/icons/tiers/${rankValue}.png`;
  }
}
