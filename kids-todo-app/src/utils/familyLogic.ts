import { AppState, Family, Child, Parent, Task, Reward } from '../types';

export function createFamily(name: string, parents: Parent[], children: Child[]): Family {
  return {
    id: Date.now().toString(),
    name,
    createdAt: new Date(),
    parents,
    children,
  };
}

export function calculateChildLevel(totalXp: number): number {
  return Math.floor(totalXp / 50) + 1;
}

export function addTask(
  appState: AppState,
  taskData: Omit<Task, 'id' | 'status' | 'completedAt' | 'approvedAt' | 'lastResetAt'>
): AppState {
  const newTask: Task = {
    ...taskData,
    id: Date.now().toString(),
    status: 'pending',
    lastResetAt: taskData.recurrence === 'once' ? undefined : new Date(),
  };

  return {
    ...appState,
    tasks: [...appState.tasks, newTask],
  };
}

export function updateTaskStatus(
  appState: AppState,
  taskId: string,
  status: Task['status']
): AppState {
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return appState;

  const updatedTask = { ...task, status };
  
  if (status === 'completed') {
    updatedTask.completedAt = new Date();
  } else if (status === 'approved') {
    updatedTask.approvedAt = new Date();
    
    // Award coins and XP to the child
    const child = appState.family?.children.find(c => c.id === task.assignedTo);
    if (child) {
      const updatedChildren = appState.family!.children.map(c => {
        if (c.id === task.assignedTo) {
          const newTotalXp = c.totalXp + task.xp;
          return {
            ...c,
            coins: c.coins + task.coins,
            totalXp: newTotalXp,
            level: calculateChildLevel(newTotalXp),
          };
        }
        return c;
      });
      
      const updatedTasks = appState.tasks.map(t => 
        t.id === taskId ? updatedTask : t
      );
      
      return {
        ...appState,
        family: {
          ...appState.family!,
          children: updatedChildren,
        },
        tasks: updatedTasks,
      };
    }
  }
  
  const updatedTasks = appState.tasks.map(t => 
    t.id === taskId ? updatedTask : t
  );

  return {
    ...appState,
    tasks: updatedTasks,
  };
}

export function addReward(
  appState: AppState,
  rewardData: Omit<Reward, 'id' | 'redeemedBy' | 'redeemedAt'>
): AppState {
  const newReward: Reward = {
    ...rewardData,
    id: Date.now().toString(),
  };

  return {
    ...appState,
    rewards: [...appState.rewards, newReward],
  };
}

export function redeemReward(
  appState: AppState,
  rewardId: string,
  childId: string
): AppState {
  const reward = appState.rewards.find(r => r.id === rewardId);
  const child = appState.family?.children.find(c => c.id === childId);
  
  if (!reward || !child || child.coins < reward.cost || reward.redeemedBy) {
    return appState;
  }

  const updatedRewards = appState.rewards.map(r => {
    if (r.id === rewardId) {
      return {
        ...r,
        redeemedBy: childId,
        redeemedAt: new Date(),
      };
    }
    return r;
  });

  const updatedChildren = appState.family!.children.map(c => {
    if (c.id === childId) {
      return {
        ...c,
        coins: c.coins - reward.cost,
      };
    }
    return c;
  });

  return {
    ...appState,
    rewards: updatedRewards,
    family: {
      ...appState.family!,
      children: updatedChildren,
    },
  };
}

export function getTasksForChild(appState: AppState, childId: string): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return appState.tasks.filter(task => {
    if (task.assignedTo !== childId) return false;
    
    // For daily tasks, show today's tasks
    if (task.recurrence === 'daily') {
      return true;
    }
    
    // For weekly tasks, check if it's the start of the week
    if (task.recurrence === 'weekly') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return true;
    }
    
    // For monthly tasks, check if it's the start of the month
    if (task.recurrence === 'monthly') {
      return today.getDate() === 1;
    }
    
    return false;
  });
}

export function getTasksNeedingApproval(appState: AppState): Task[] {
  return appState.tasks.filter(task => task.status === 'completed');
}

export function shouldResetTask(task: Task): boolean {
  if (task.recurrence === 'once') return false;
  
  const now = new Date();
  const lastReset = task.lastResetAt || task.createdAt;
  
  // Controllo di sicurezza per date undefined
  if (!lastReset) return true;
  
  switch (task.recurrence) {
    case 'daily':
      // Reset se l'ultimo reset è stato prima di oggi
      return lastReset.toDateString() !== now.toDateString();
    
    case 'weekly':
      // Reset se è lunedì e l'ultimo reset è stato prima di questa settimana
      if (now.getDay() !== 1) return false; // Solo lunedì
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1); // Lunedì di questa settimana
      weekStart.setHours(0, 0, 0, 0);
      return lastReset < weekStart;
    
    case 'monthly':
      // Reset se è il primo del mese e l'ultimo reset è stato prima di questo mese
      if (now.getDate() !== 1) return false; // Solo il primo del mese
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return lastReset < monthStart;
    
    default:
      return false;
  }
}

export function resetRecurringTasks(appState: AppState): AppState {
  const tasksToReset = appState.tasks.filter(task => 
    task.status === 'approved' && shouldResetTask(task)
  );
  
  if (tasksToReset.length === 0) return appState;
  
  const updatedTasks = appState.tasks.map(task => {
    if (tasksToReset.includes(task)) {
      return {
        ...task,
        status: 'pending' as const,
        completedAt: undefined,
        approvedAt: undefined,
        lastResetAt: new Date(),
      };
    }
    return task;
  });
  
  return {
    ...appState,
    tasks: updatedTasks,
  };
}
