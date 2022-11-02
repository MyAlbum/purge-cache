const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const debug = core.getInput('debug') === 'true';
  const maxAge = core.getInput('max-age');
  const token = core.getInput('token');
  const octokit = github.getOctokit(token);
  const maxDate = new Date(Date.now() - maxAge * 1000)

  const { data: cachesRequest } = await octokit.rest.actions.getActionsCacheList({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    per_page: 100,
  });

  if(debug) {
    console.log(`Found ${cachesRequest.actions_caches.length} caches`);
  }

  cachesRequest.actions_caches.forEach(async (cache) => {
    const cacheDate = new Date(cache.last_accessed_at);
    if (cacheDate < maxDate) {
      if(debug) {
        console.log(`Deleting cache ${cache.key}, last accessed at ${cacheDate} before ${maxDate}`);
      }

      await octokit.rest.actions.deleteActionsCacheById({
        per_page: 100,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        cache_id: cache.id,
      });
    } else if (debug) {
      console.log(`Skipping cache ${cache.key}, last accessed at ${cacheDate} after ${maxDate}`);
    }
  });
}

run();