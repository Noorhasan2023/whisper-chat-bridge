// Test script to debug translation
const testTranslation = async () => {
  const response = await fetch('https://bfhzvuwxkrmjkfqryvls.supabase.co/functions/v1/translate-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaHp2dXd4a3JtamtmcXJ5dmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDU5OTcsImV4cCI6MjA2NzgyMTk5N30.H7QkzR606dSkC9udpwwUC0Yq06cUQ4nAKSgC38omc68'
    },
    body: JSON.stringify({
      messageId: '93922b42-b917-4801-b137-f9201d29177f', // Use a recent message ID
      targetLanguages: ['hi']  // Only Hindi to test
    })
  });
  
  const result = await response.json();
  console.log('Test translation result:', result);
};

testTranslation();