
const { Client } = require('pg');

const password = 'h8jc6Iu5zCX906Ok';
const projectRef = 'cpkgcatqhqdkitizomea';
const regions = [
    'aws-0-us-east-1',
    'aws-0-us-west-1',
    'aws-0-eu-central-1',
    'aws-0-ap-southeast-1',
    'aws-0-sa-east-1',
];

async function testConnection(region) {
    const host = `${region}.pooler.supabase.com`;
    const connectionString = `postgres://postgres.${projectRef}:${password}@${host}:6543/postgres`;

    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        console.log(`Testing ${region}...`);
        await client.connect();
        console.log(`✅ Success! Connected to ${region}`);
        await client.end();
        return connectionString;
    } catch (err) {
        // If auth failed, we found the server but password explains it (or connection succeeded enough to auth)
        if (err.message.includes('password authentication failed')) {
            console.log(`✅ Found the server at ${region}, but password was wrong.`);
            return connectionString;
        }
        console.log(`❌ Failed ${region}: ${err.message}`);
        return null;
    }
}

async function run() {
    for (const region of regions) {
        const valid = await testConnection(region);
        if (valid) {
            console.log('\nFOUND CONNECTION STRING:');
            console.log(valid);
            process.exit(0);
        }
    }
    console.log('Could not automatically determine region.');
    process.exit(1);
}

run();
