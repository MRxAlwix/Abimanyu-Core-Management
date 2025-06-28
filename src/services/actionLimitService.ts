import { notificationService } from './notificationService';

interface ActionLimit {
  userId: string;
  actionsUsed: number;
  maxActions: number;
  resetDate: string;
  isPremium: boolean;
}

class ActionLimitService {
  private readonly FREE_LIMIT = 100;
  private readonly PREMIUM_LIMIT = 500;

  getActionLimit(userId: string, isPremium: boolean): ActionLimit {
    const storageKey = `action_limit_${userId}`;
    const stored = localStorage.getItem(storageKey);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (stored) {
      const limit: ActionLimit = JSON.parse(stored);
      
      // Reset if new month
      if (limit.resetDate !== currentMonth) {
        return this.resetActionLimit(userId, isPremium, currentMonth);
      }
      
      // Update premium status if changed
      if (limit.isPremium !== isPremium) {
        limit.isPremium = isPremium;
        limit.maxActions = isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT;
        this.saveActionLimit(limit);
      }
      
      return limit;
    }
    
    return this.resetActionLimit(userId, isPremium, currentMonth);
  }

  private resetActionLimit(userId: string, isPremium: boolean, resetDate: string): ActionLimit {
    const limit: ActionLimit = {
      userId,
      actionsUsed: 0,
      maxActions: isPremium ? this.PREMIUM_LIMIT : this.FREE_LIMIT,
      resetDate,
      isPremium,
    };
    
    this.saveActionLimit(limit);
    return limit;
  }

  private saveActionLimit(limit: ActionLimit) {
    const storageKey = `action_limit_${limit.userId}`;
    localStorage.setItem(storageKey, JSON.stringify(limit));
  }

  canPerformAction(userId: string, isPremium: boolean): boolean {
    const limit = this.getActionLimit(userId, isPremium);
    return limit.actionsUsed < limit.maxActions;
  }

  performAction(userId: string, isPremium: boolean, actionType: string): boolean {
    const limit = this.getActionLimit(userId, isPremium);
    
    if (limit.actionsUsed >= limit.maxActions) {
      notificationService.warning(
        `Batas aksi bulanan tercapai (${limit.maxActions}). ${isPremium ? 'Upgrade ke Loyal untuk unlimited.' : 'Upgrade ke Premium untuk lebih banyak aksi.'}`
      );
      return false;
    }
    
    limit.actionsUsed += 1;
    this.saveActionLimit(limit);
    
    // Warning when approaching limit
    const remaining = limit.maxActions - limit.actionsUsed;
    if (remaining <= 10 && remaining > 0) {
      notificationService.warning(`Sisa ${remaining} aksi bulan ini`);
    }
    
    return true;
  }

  getActionStatus(userId: string, isPremium: boolean): { used: number; max: number; remaining: number; percentage: number } {
    const limit = this.getActionLimit(userId, isPremium);
    const remaining = limit.maxActions - limit.actionsUsed;
    const percentage = (limit.actionsUsed / limit.maxActions) * 100;
    
    return {
      used: limit.actionsUsed,
      max: limit.maxActions,
      remaining,
      percentage,
    };
  }
}

export const actionLimitService = new ActionLimitService();