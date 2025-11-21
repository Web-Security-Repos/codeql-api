// list-org-repos.js
// Script to list all repositories in the Web-Security-Repos organization

const https = require('https');

const ORG_NAME = 'Web-Security-Repos';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is not set.');
  console.error('Please set it with: $env:GITHUB_TOKEN="your_token_here" (Windows PowerShell)');
  console.error('Or: export GITHUB_TOKEN="your_token_here" (Linux/Mac)');
  process.exit(1);
}

/**
 * Make a GET request to GitHub API
 */
function makeGitHubRequest(path, acceptHeader = 'application/vnd.github+json') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': acceptHeader,
        'User-Agent': 'CodeQL-API-Client'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsed, headers: res.headers });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: data, headers: res.headers });
          }
        } else {
          reject({
            statusCode: res.statusCode,
            message: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * List all repositories in the organization
 */
async function listOrgRepositories() {
  console.log('\n📋 Listing all repositories in organization...');
  console.log(`Organization: ${ORG_NAME}`);
  console.log('API Endpoint: GET /orgs/{org}/repos');
  console.log(`Full URL: https://api.github.com/orgs/${ORG_NAME}/repos\n`);

  let allRepos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const result = await makeGitHubRequest(`/orgs/${ORG_NAME}/repos?page=${page}&per_page=100`);
      
      if (Array.isArray(result.data) && result.data.length > 0) {
        allRepos = allRepos.concat(result.data);
        console.log(`📄 Page ${page}: Found ${result.data.length} repositories`);
        
        // Check if there are more pages
        const linkHeader = result.headers.link || '';
        hasMore = linkHeader.includes('rel="next"');
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`❌ Error fetching page ${page}: ${error.statusCode || 'Unknown'}`);
      console.error(error.message || error);
      hasMore = false;
    }
  }

  if (allRepos.length > 0) {
    console.log(`\n✅ Total repositories found: ${allRepos.length}\n`);
    console.log('Repository List:');
    console.log('='.repeat(80));
    
    allRepos.forEach((repo, index) => {
      console.log(`\n${index + 1}. ${repo.name}`);
      console.log(`   Full Name: ${repo.full_name}`);
      console.log(`   URL: ${repo.html_url}`);
      console.log(`   Language: ${repo.language || 'N/A'}`);
      console.log(`   Private: ${repo.private ? 'Yes' : 'No'}`);
      console.log(`   Created: ${repo.created_at}`);
      console.log(`   Updated: ${repo.updated_at}`);
      console.log(`   Clone URL: ${repo.clone_url}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📝 Test repositories (for security analysis):');
    const testRepos = allRepos.filter(repo => repo.name.startsWith('test-'));
    testRepos.forEach(repo => {
      console.log(`   - ${repo.name}`);
    });
    
    return allRepos;
  } else {
    console.log('⚠️  No repositories found.');
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('=================================================');
  console.log('   GitHub Organization Repository Lister');
  console.log('=================================================');
  
  const repos = await listOrgRepositories();
  
  console.log('\n=================================================');
  console.log('   Complete!');
  console.log('=================================================\n');
  
  return repos;
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

