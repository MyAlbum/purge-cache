import * as github from '@actions/github';
import * as core from '@actions/core';

async function run() {
  const debug = core.getInput('debug', { required: false }) === 'true';
  const maxAge = core.getInput('max-age', { required: true });
  const token = core.getInput('token', { required: false });
  const octokit = github.getOctokit(token);
  const maxDate = new Date(Date.now() - Number.parseInt(maxAge) * 1000)

  interface Cache {
    id?: number | undefined;
    ref?: string | undefined;
    key?: string | undefined;
    version?: string | undefined;
    last_accessed_at?: string | undefined;
    created_at?: string | undefined;
    size_in_bytes?: number | undefined;
  }

  const results: Cache[] = []

  for (let i = 1; i <= 100; i += 1) {
    const { data: cachesRequest } = await octokit.rest.actions.getActionsCacheList({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      per_page: 100,
      page: i
    });

    if (cachesRequest.actions_caches.length == 0) {
      break
    }
    
    results.push(...cachesRequest.actions_caches)
  }

  if (debug) {
    console.log(`Found ${results.length} caches`);
  }

  results.forEach(async (cache) => {
    if (cache.last_accessed_at !== undefined && cache.id !== undefined) {
      const cacheDate = new Date(cache.last_accessed_at);
      if (cacheDate < maxDate) {
        if (debug) {
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
    }
  });
}

run();