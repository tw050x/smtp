
/**
 * See https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression for details
 * on the regex used here
 *
 * Please not that an additional capture group was added to capture the email address
 */

const shouldPass = [
  "MAIL FROM: <user@test.com>",
  "MAIL FROM: <user@test.com> ",
  "MAIL FROM: <user@test.com>   ",
  "MAIL FROM:    <user@test.com>",
  "MAIL FROM:    <user@test.com> ",
  "MAIL FROM:    <user@test.com>    ",
  "MAIL FROM:<user@test.com>",
  "MAIL FROM:<user@test.com>  ",
  "MAIL FROM:<qgmrfrom@qualysguard.com>",
  "MAIL FROM:<jgtbegob@lblaboite.fr>",
  "MAIL FROM:<mnpkf@lblaboite.fr>",
  "MAIL FROM:<bxbevpr@lblaboite.fr>",
  "MAIL FROM:<jmlhqqfsd@lblaboite.fr>",
  "MAIL FROM: <test123@abc.com>",
  "MAIL FROM: <test@abc.com>",
  "MAIL FROM: <Derek28@hotmail.com>",
  "MAIL FROM:<Houston.Friesen@gmail.com>",
  "MAIL FROM:<bounces+45946214-02d0-collector=site.co.uk@mail-sendgrid.q4inc.com>",
];

const shouldFail = [
  "MAIL FROM: <user@test.com user@test.com>",
  "MAIL FROM: <user@test.com user@test.com >",
  "MAIL FROM: <user@test.com user@test.com user@test.com>",
  "MAIL FROM: <user@test.com user@test.com user@test.com >",
  "MAIL FROM: <user@test.com usertest.com>",
  "MAIL FROM: <user@test.com usertest.com >",
  "MAIL FROM: <user@test.com usertest.com usertest.com>",
  "MAIL FROM: <user@test.com usertest.com user@test.com>",
  "MAIL FROM: <usertest.com>",
  "MAIL FROM: <usertest.com usertest.com>",
  "MAIL FROM: <usertest.com usertest.com usertest.com>",
  "MAIL FROM: abc@abc.com",
  "MAIL FROM: qgmrfrom@qualysguard.com",
  "MAIL FROM test123",
  "MAIL FROM: <>",
  "MAIL FROM: a@b.com b@c.com",
  "MAIL FROM: <a@b.com b@c.com>",
  "MAIL FROM: <test@abc.com",
  "MAIL FROM: <abc123.com>",
  "MAIL FROM:",
  "MAIL FROM: test@qualys.com",
  "MAIL FROM: Test123",
  "MAIL FROM: Test123@smtpDomain.com",
  "MAIL FROM test123",
  "MAIL FROM: <>",
  "MAIL FROM: <>",
  "MAIL FROM: a@b.com b@c.com",
  "MAIL FROM: <a@b.com b@c.com>",
  "MAIL FROM: <test@abc.com",
  "MAIL FROM: <abc123.com>",
  "MAIL FROM: abc@abc.com",
  "MAIL FROM test123",
  "MAIL FROM: <>",
  "MAIL FROM: a@b.com b@c.com",
  "MAIL FROM: <a@b.com b@c.com>",
  "MAIL FROM: <test@abc.com",
  "MAIL FROM: <abc123.com>",
  "MAIL FROM:",
  "MAIL FROM: Test123",
  "MAIL FROM: Test123@smtpDomain.com",
];

const entries = [
  ...shouldPass,
  ...shouldFail,
];

const mailFromRegex = /^MAIL FROM:[ \t]*<((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>[ \t]*/i;

function validateMailFrom(input) {
  const match = input.match(mailFromRegex);
  console.log(`   Validating: "${input}"`);
  console.log(`   Match results: ${match}`);
  return match
    ? { isValid: true, email: match[1] }
    : { isValid: false };
}

entries.forEach((entry, index) => {
  console.log(`\nEntry ${index + 1}:`);
  const result = validateMailFrom(entry);
  const expectedResult = shouldPass.includes(entry);
  const status = result.isValid === expectedResult ? '✅' : '❌';

  console.log(`   Status: ${status}`);
  console.log(`   Input: "${entry}"`);
  if (result.isValid && result.email) {
      console.log(`   Captured email: ${result.email}`);
  }
  console.log(`   Expected: ${expectedResult ? 'PASS' : 'FAIL'}, Got: ${result.isValid ? 'PASS' : 'FAIL'}`);
});
