// @ts-check

import { getStateWithProjectItems } from "./lib/get-state-with-project-items.js";
import { removeItemFromProjectMutation } from "./lib/queries.js";

/**
 * Removes an item if it exists. Resolves with `undefined` either way
 * In order to find an item by repository name and number, all items need to be loaded first.
 *
 * @param {import("..").default} project
 * @param {import("..").GitHubProjectState} state
 * @param {string} repositoryName
 * @param {number} issueOrPullRequestNumber
 * @returns {Promise<void>}
 */
export async function removeItemByContentRepositoryAndNumber(
  project,
  state,
  repositoryName,
  issueOrPullRequestNumber
) {
  const stateWithItems = await getStateWithProjectItems(project, state);

  const existingItem = stateWithItems.items.find((item) => {
    if (item.isDraft === true) return;

    return (
      item.content.repository === repositoryName &&
      item.content.number === issueOrPullRequestNumber
    );
  });

  if (!existingItem) return;

  await project.octokit.graphql(removeItemFromProjectMutation, {
    projectId: stateWithItems.id,
    itemId: existingItem.id,
  });

  // update cache
  stateWithItems.items = stateWithItems.items.filter(
    (item) => item.id !== existingItem.id
  );
}
