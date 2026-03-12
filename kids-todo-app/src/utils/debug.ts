// Debug utility per controllare lo stato dell'app
export function debugAppState() {
  const stored = localStorage.getItem('eroi-di-casa-state');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      console.log('=== APP STATE DEBUG ===');
      console.log('Setup Complete:', parsed.setupComplete);
      console.log('Current Mode:', parsed.currentMode);
      console.log('Family:', parsed.family);
      console.log('Tasks count:', parsed.tasks?.length || 0);
      console.log('Rewards count:', parsed.rewards?.length || 0);
      console.log('Current Child ID:', parsed.currentChildId);
      console.log('========================');
      return parsed;
    } catch (error) {
      console.error('Error parsing stored state:', error);
    }
  } else {
    console.log('No stored state found');
  }
  return null;
}

export function clearAppState() {
  localStorage.removeItem('eroi-di-casa-state');
  console.log('App state cleared');
}
