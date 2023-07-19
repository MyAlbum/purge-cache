import * as github from '@actions/github';
import * as core from '@actions/core';

function setFailedWrongValue(input: string, value: string) {
  core.setFailed(`Wrong value for the input '${input}': ${value}`);
}

enum Inputs {
  Debug = "debug",
  MaxAge = "max-age",
  ByTime = "by-time"
}

enum ByTimeValues {
  Accessed = "accessed",
  Created = "created"
}

async function run() {
  const debug = core.getInput(Inputs.Debug, { required: false }) === 'true';

  const maxAge = core.getInput(Inputs.MaxAge, { required: true });
  const maxDate = new Date(Date.now() - Number.parseInt(maxAge) * 1000)
  if (maxDate === null) {
    setFailedWrongValue(Inputs.MaxAge, maxAge)
  }

  const byTime = core.getInput(Inputs.ByTime, { required: false });
  if (!(byTime === ByTimeValues.Accessed || byTime === ByTimeValues.Created)) {
    setFailedWrongValue(Inputs.ByTime, byTime)
  }
  const doUseAccessedTime = byTime == ByTimeValues.Accessed;

  const token = core.getInput('token', { required: false });
  const octokit = github.getOctokit(token);

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
      const phrase = doUseAccessedTime ? "last accessed" : "created";
      if (cacheDate < maxDate) {
        if (debug) {
          console.log(`Deleting cache ${cache.key}, ${phrase} at ${cacheDate} before ${maxDate}`);
        }

        try {
          await octokit.rest.actions.deleteActionsCacheById({
            per_page: 100,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            cache_id: cache.id,
          });
        } catch (error) {
          console.log(`Failed to delete cache ${cache.key};\n\n${error}`);
        }
      } else if (debug) {
        console.log(`Skipping cache ${cache.key}, ${phrase} at ${cacheDate} after ${maxDate}`);
      }
    }
  });
}

run();