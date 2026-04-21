import { validateEmail } from './utils/emailValidator.js';

async function testEmailValidation() {
  console.log('Testing email validation...');

  const testEmails = [
    'test@example.com',
    'user@gmail.com',
    'invalid-email',
    'test@nonexistentdomain12345.com'
  ];

  for (const email of testEmails) {
    console.log(`\nTesting: ${email}`);
    try {
      const result = await validateEmail(email, { checkSMTP: false });
      console.log('Result:', result);
    } catch (error) {
      console.log('Error:', error);
    }
  }
}

testEmailValidation();