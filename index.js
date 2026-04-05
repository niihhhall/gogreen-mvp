import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";

/**
 * Creates a backdated commit using simple-git.
 * @param {number} n - Number of commits remaining to be made.
 */
const makeCommits = async (n) => {
  if (n === 0) {
    console.log("Finished making commits. Pushing to remote...");
    return simpleGit().push();
  }

  // Generate a random date within the last 52 weeks
  const x = random.int(0, 54); // Random week
  const y = random.int(0, 6);  // Random day of the week
  
  const date = moment()
    .subtract(1, "y")
    .add(1, "d")
    .add(x, "w")
    .add(y, "d")
    .format();

  const data = {
    date: date,
  };

  console.log(`Creating commit for: ${date}`);

  try {
    await jsonfile.writeFile(path, data);
    await simpleGit().add([path]).commit(date, { "--date": date });
    
    // Recursive call for the next commit
    await makeCommits(n - 1);
  } catch (err) {
    console.error("Error creating commit:", err);
  }
};

// Start the process by creating 100 commits
makeCommits(100);
