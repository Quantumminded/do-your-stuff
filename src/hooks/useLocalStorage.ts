import { useState, useEffect } from 'react';
import { AppState, Family, Task, Reward, Child, Parent } from '../types';

const STORAGE_KEY = 'eroi-di-casa-state';

const defaultState: AppState = {
  family: null as any,
  tasks: [],
  rewards: [],
  currentMode: 'parent',
  currentChildId: '',
  setupComplete: false,
  parentPin: '1234',
};

export function useFamilyStorage() {
  const [appState, setAppState] = useState<AppState>(defaultState);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.family) {
          parsed.family.createdAt = new Date(parsed.family.createdAt);
        }
        parsed.tasks = parsed.tasks.map((task: any) => ({
          ...task,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          approvedAt: task.approvedAt ? new Date(task.approvedAt) : undefined,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          lastResetAt: task.lastResetAt ? new Date(task.lastResetAt) : undefined,
        }));
        parsed.rewards = parsed.rewards.map((reward: any) => ({
          ...reward,
          redeemedAt: reward.redeemedAt ? new Date(reward.redeemedAt) : undefined,
        }));
        
        // Migrazione per vecchi dati senza PIN e currentChildId
        if (!parsed.parentPin) {
          parsed.parentPin = '1234';
        }
        if (!parsed.currentChildId) {
          parsed.currentChildId = parsed.family?.children?.[0]?.id || '';
        }
        
        setAppState(parsed);
      } catch (error) {
        console.error('Error parsing stored app state:', error);
      }
    }
  }, []);

  const updateState = (newState: AppState) => {
    setAppState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const resetApp = () => {
    setAppState(defaultState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  };

  return { appState, updateState, resetApp };
}
