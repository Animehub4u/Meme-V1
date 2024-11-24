const axios = require('axios');
const fs = require('fs');
const querystring = require('querystring');
const chalk = require('chalk'); 

// Define referral code and guild ID
const referralCode = 'XYJMJD';
const guildId = '26a2d5e5-3d33-47f5-813f-3bb826a2fc0f';

// Load User-Agent list from file
const userAgents = fs.readFileSync('user-agent-phone.txt', 'utf8').trim().split('\n');

// Function to validate User-Agent strings
function isValidUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return false;
  }

  // Check for forbidden characters such as newlines or control characters
  const forbiddenCharsRegex = /[\n\r\t\b\f\v]/;

  return !forbiddenCharsRegex.test(userAgent);
}

// Function to get a random, valid User-Agent
function getRandomUserAgent() {
  let randomUserAgent;
  do {
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    randomUserAgent = userAgents[randomIndex].trim();
  } while (!isValidUserAgent(randomUserAgent));
  return randomUserAgent;
}

// Store User-Agent for each queryId
const queryIdUserAgentMap = new Map();

async function getUserInfo(queryId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const response = await axios.get('https://memes-war.memecore.com/api/user', { headers });
    return response.data.data.user;
  } catch (error) {
    console.error(chalk.red('Error getting user info:', error));
  }
}

async function setReferralCode(queryId, userInfo) {
  if (userInfo && userInfo.inputReferralCode === null) {
    try {
      const encodedQueryId = encodeURIComponent(queryId);
      const headers = {
        Cookie: `telegramInitData=${encodedQueryId}`,
        'User-Agent': queryIdUserAgentMap.get(queryId)
      };
      const url = `https://memes-war.memecore.com/api/user/referral/${referralCode}`;
      const response = await axios.put(url, null, { headers });
    } catch (error) {
      console.error(chalk.red('Error setting referral code:', error));
    }
  } else {
    console.log(chalk.yellow('Referral code already set.'));
  }
}

async function checkRewards(queryId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const response = await axios.get('https://memes-war.memecore.com/api/quest/treasury/rewards', { headers });
    return response.data.data;
  } catch (error) {
    console.error(chalk.red('Error checking rewards:', error));
  }
}

async function claimRewards(queryId, rewards) {
  try {
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const payload = {
      data: rewards
    };
    const response = await axios.post('https://memes-war.memecore.com/api/quest/treasury', payload, { headers });

    if (response.data && response.data.data && response.data.data.rewards) {
      const rewardDetails = response.data.data.rewards.map(reward => {
        return `${reward.rewardAmount} ${reward.rewardType}`;
      }).join(', ');

      console.log(chalk.blue(`Rewards claimed: ${rewardDetails}`));
    } else {
      console.log(chalk.yellow('No rewards data found in the response.'));
    }
  } catch (error) {
    console.error(chalk.red('Error claiming rewards:', error));
  }
}

async function donateWarbondToGuild(queryId, warbondTokens) {
  try {
	  const remainingWarbonds = warbondTokens - 1000;

    // Skip donation if remaining warbonds are 0
    if (remainingWarbonds === 0) {
      console.log(chalk.yellow('Skipping donation as remaining warbonds are 0.'));
      return;
    }
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const payload = {
      guildId: guildId,
      warbondCount: warbondTokens-1000
    };
    const response = await axios.post('https://memes-war.memecore.com/api/guild/warbond', payload, { headers });
    if (response.data && response.data.data === null) {
      console.log(chalk.green('Donate to guild was successful.'));
    }
  } catch (error) {
    console.error(chalk.red('Error donating warbond to guild:', error));
  }
}

async function getCheckInData(queryId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const response = await axios.get('https://memes-war.memecore.com/api/quest/check-in', { headers });
    return response.data.data;
  } catch (error) {
    console.error(chalk.red('Error getting check-in data:', error));
  }
}

async function checkIn(queryId, consecutiveDays, rewards) {
  try {
    const encodedQueryId = encodeURIComponent(queryId);
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId)
    };
    const payload = {
      data: {
        currentConsecutiveCheckIn: consecutiveDays,
        rewards: rewards
      }
    };
    const response = await axios.post('https://memes-war.memecore.com/api/quest/check-in', payload, { headers });
    if (response.data) {
      console.log(chalk.green('Check-in success.'));
    }
  } catch (error) {
    console.error(chalk.red('Error during check-in:', error));
  }
}

async function getQuestList(queryId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId); // Encode queryId for use in headers
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`,
      'User-Agent': queryIdUserAgentMap.get(queryId), // Using User-Agent from the map
    };

    // Fetch quests from both endpoints
    const [dailyResponse, generalResponse] = await Promise.all([
      axios.get('https://memes-war.memecore.com/api/quest/daily/list', { headers }),
      axios.get('https://memes-war.memecore.com/api/quest/general/list', { headers }),
    ]);

    // Combine quests from both responses
    const dailyQuests = dailyResponse.data?.data?.quests || [];
    const generalQuests = generalResponse.data?.data?.quests || [];

    return [...dailyQuests, ...generalQuests]; // Combine and return all quests
  } catch (error) {
    console.error(chalk.red('Error fetching quest list:', error));
    return []; // Return an empty array in case of error
  }
}


async function verifyTask(queryId, questId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId); // Encode queryId for use in headers
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`, // Using encodedQueryId in headers
      'User-Agent': queryIdUserAgentMap.get(queryId), // Using User-Agent from the map
    };
    const payload = {
      data: {
        status: "VERIFY",
        rewards: []
      }
    };
    const response = await axios.post(`https://memes-war.memecore.com/api/quest/daily/${questId}/progress`, payload, { headers });
    return response.data; // Return the response from the verify task
  } catch (error) {
    console.error(chalk.red('Error verifying task:', error));
  }
}

async function claimTask(queryId, questId) {
  try {
    const encodedQueryId = encodeURIComponent(queryId); // Encode queryId for use in headers
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`, // Using encodedQueryId in headers
      'User-Agent': queryIdUserAgentMap.get(queryId), // Using User-Agent from the map
    };
    const payload = {
      data: {
        status: "CLAIM",
        rewards: []
      }
    };
    const response = await axios.post(`https://memes-war.memecore.com/api/quest/daily/${questId}/progress`, payload, { headers });
    return response.data; // Return the response from the claim task
  } catch (error) {
    console.error(chalk.red('Error claiming task:', error));
  }
}

async function claimTaskReward(queryId, questId, rewards) {
  try {
    const encodedQueryId = encodeURIComponent(queryId); // Encode queryId for use in headers
    const headers = {
      Cookie: `telegramInitData=${encodedQueryId}`, // Using encodedQueryId in headers
      'User-Agent': queryIdUserAgentMap.get(queryId), // Using User-Agent from the map
    };
    const payload = {
      data: {
        status: "DONE",
        rewards: rewards
      }
    };
    const response = await axios.post(`https://memes-war.memecore.com/api/quest/daily/${questId}/progress`, payload, { headers });
    return response.data; // Return the response from claiming rewards
  } catch (error) {
    console.error(chalk.red('Error claiming task reward:', error));
  }
}

async function processQuests(queryId) {
  const quests = await getQuestList(queryId); // Fetch the quest list
  for (const quest of quests) {
    console.log(chalk.magenta(`Processing Quest: ${quest.title} (ID: ${quest.id})`));
    
    switch (quest.status) {
      case 'GO':
        console.log(chalk.yellow(`Quest is ready to verify...`));
        const verifyResponse = await verifyTask(queryId, quest.id); // Verify the task
        if (verifyResponse) {
          console.log(chalk.green(`Task verified: ${quest.title}`));
          
          // Delay for 5 seconds after verifying
          await new Promise(resolve => setTimeout(resolve, 5000));

          const claimResponse = await claimTask(queryId, quest.id); // Claim the task
          if (claimResponse) {
            console.log(chalk.green(`Task claimed: ${quest.title}`));
            const rewards = quest.rewards; // Extract rewards from the quest
            await claimTaskReward(queryId, quest.id, rewards); // Claim the rewards
            console.log(chalk.green(`Rewards claimed for ${quest.title}`));
          }
        }
        break;

      case 'VERIFY':
        console.log(chalk.yellow(`Quest is in VERIFY status. Claiming task...`));
        const claimTaskResponse = await claimTask(queryId, quest.id); // Claim the task
        if (claimTaskResponse) {
          console.log(chalk.green(`Task claimed: ${quest.title}`));

          // Delay for 5 seconds after claiming
          await new Promise(resolve => setTimeout(resolve, 5000));

          const rewards = quest.rewards;
          await claimTaskReward(queryId, quest.id, rewards); // Claim the rewards
          console.log(chalk.green(`Rewards claimed for ${quest.title}`));
        }
        break;

      case 'CLAIM':
        console.log(chalk.yellow(`Quest is in CLAIM status. Claiming rewards...`));
        const claimRewardResponse = await claimTaskReward(queryId, quest.id, quest.rewards); // Claim rewards
        if (claimRewardResponse) {
          console.log(chalk.green(`Rewards claimed for ${quest.title}`));
        }
        break;

      case 'DONE':
      case 'IN_PROGRESS':
        console.log(chalk.gray(`Skipping task: ${quest.title} (Status: ${quest.status})`));
        break;

      default:
        console.log(chalk.red(`Unknown status for quest: ${quest.title}`));
        break;
    }

    console.log(chalk.blue(`--- Finished processing ${quest.title} ---`));
  }
}


async function processAccount(queryId) {
  const decodedData = decodeURIComponent(queryId);
  const parsedData = querystring.parse(decodedData);
  const userJson = parsedData.user;

  let username = 'Unknown User';
  if (userJson) {
    try {
      const userData = JSON.parse(userJson);
      username = userData.username || username;
    } catch (error) {
      console.error(chalk.red('Error parsing user JSON:', error));
    }
  }

  // Assign a random User-Agent for this queryId
  if (!queryIdUserAgentMap.has(queryId)) {
    queryIdUserAgentMap.set(queryId, getRandomUserAgent());
  }

  console.log(chalk.magenta(`\n--- Processing Account: ${username} ---`));

  let userInfo = await getUserInfo(queryId);

  if (userInfo) {
    console.log(chalk.cyan(`\nNickname: ${userInfo.nickname}`));
    console.log(chalk.cyan(`Rank: ${userInfo.honorPointRank}`));
    console.log(chalk.cyan(`Warbond: ${userInfo.warbondTokens}`));
    console.log(chalk.cyan(`Honor Point: ${userInfo.honorPoints}\n`));
  }

  await setReferralCode(queryId, userInfo);
  
  // Check-in functionality
const checkInData = await getCheckInData(queryId);
if (checkInData && checkInData.checkInRewards) {
  const claimableReward = checkInData.checkInRewards.find(reward => reward.status === 'CLAIMABLE');
  if (claimableReward) {
    const rewardDetails = claimableReward.rewards
      .map(reward => `${reward.rewardAmount} ${reward.rewardType}`)
      .join(', ');

    console.log(chalk.blue(`Check In Day ${claimableReward.consecutiveDays} Success, Reward: ${rewardDetails}`));
    await checkIn(queryId, claimableReward.consecutiveDays, claimableReward.rewards);
  } else {
    console.log(chalk.yellow('You already checkin today.'));
  }
}

  
  // Check if rewards are available
  const rewardsData = await checkRewards(queryId);
  
  if (rewardsData && rewardsData.leftSecondsUntilTreasury === 0) {
    const rewardsToClaim = {
      rewards: rewardsData.rewards,
      leftSecondsUntilTreasury: 3600,
      rewardCooldownSeconds: 3600
    };
    await claimRewards(queryId, rewardsToClaim);
  } else {
    console.log('Rewards not available yet. Try again later.');
  }

  // Fetch quests using the queryId directly
  const quests = await getQuestList(queryId); // Pass queryId directly to getQuestList
  for (const quest of quests) {
    console.log(chalk.magenta(`Processing Quest: ${quest.title} (ID: ${quest.id})`));

    switch (quest.status) {
      case 'GO':
        console.log(chalk.yellow(`Quest is ready to verify...`));
        const verifyResponse = await verifyTask(queryId, quest.id); // Pass queryId to verifyTask
        if (verifyResponse) {
          console.log(chalk.green(`Task verified: ${quest.title}`));
          
          // Delay for 5 seconds after verifying
          await new Promise(resolve => setTimeout(resolve, 5000));

          const claimResponse = await claimTask(queryId, quest.id); // Pass queryId to claimTask
          if (claimResponse) {
            console.log(chalk.green(`Task claimed: ${quest.title}`));
            const rewards = quest.rewards; // Extract rewards from the quest
            await claimTaskReward(queryId, quest.id, rewards); // Pass queryId to claimTaskReward
            console.log(chalk.green(`Rewards claimed for ${quest.title}`));
          }
        }
        break;

      case 'VERIFY':
        console.log(chalk.yellow(`Quest is in VERIFY status. Claiming task...`));
        const claimTaskResponse = await claimTask(queryId, quest.id); // Pass queryId to claimTask
        if (claimTaskResponse) {
          console.log(chalk.green(`Task claimed: ${quest.title}`));
          
          // Delay for 5 seconds after claiming
          await new Promise(resolve => setTimeout(resolve, 5000));

          const rewards = quest.rewards;
          await claimTaskReward(queryId, quest.id, rewards); // Pass queryId to claimTaskReward
          console.log(chalk.green(`Rewards claimed for ${quest.title}`));
        }
        break;

      case 'CLAIM':
        console.log(chalk.yellow(`Quest is in CLAIM status. Claiming rewards...`));
        const claimRewardResponse = await claimTaskReward(queryId, quest.id, quest.rewards); // Pass queryId
        if (claimRewardResponse) {
          console.log(chalk.green(`Rewards claimed for ${quest.title}`));
        }
        break;

      case 'DONE':
      case 'IN_PROGRESS':
        console.log(chalk.gray(`Skipping task: ${quest.title} (Status: ${quest.status})`));
        break;

      default:
        console.log(chalk.red(`Unknown status for quest: ${quest.title}`));
        break;
    }

    console.log(chalk.blue(`--- Finished processing ${quest.title} ---`));
  }

  // Update user balance after quests without printing it yet
  let updatedUserInfo = await getUserInfo(queryId); // Use queryId directly
  
  // Donate Warbond Tokens to Guild if available
  if (updatedUserInfo && updatedUserInfo.warbondTokens > 0) {
    await donateWarbondToGuild(queryId, updatedUserInfo.warbondTokens);
  } else {
    console.log(chalk.yellow('No Warbond tokens available to donate.'));
  }
  // Update user balance after quests without printing it yet
  updatedUserInfo = await getUserInfo(queryId); // Use queryId directly

  // Now print the ending balance
  if (updatedUserInfo) {
    console.log(chalk.green('--- Ending Balance ---'));
    console.log(chalk.cyan(`Nickname: ${updatedUserInfo.nickname}`));
    console.log(chalk.cyan(`Rank: ${updatedUserInfo.honorPointRank}`));
    console.log(chalk.cyan(`Warbond: ${updatedUserInfo.warbondTokens}`));
    console.log(chalk.cyan(`Honor Point: ${updatedUserInfo.honorPoints}`));
    console.log(chalk.green('--- End of Account Processing ---\n'));
  }
}



function printHeader() {
    const line = "=".repeat(50);
    const title = "Memes War Bot";
    const createdBy = "Bot created by: https://t.me/airdropwithmeh";

    const totalWidth = 50;
    const titlePadding = Math.floor((totalWidth - title.length) / 2);
    const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

    const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
    const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

    console.log(chalk.cyan.bold(line));
    console.log(chalk.cyan.bold(centeredTitle));
    console.log(chalk.green(centeredCreatedBy));
    console.log(chalk.cyan.bold(line));
}

async function main() {
	printHeader();
  const queryIds = fs.readFileSync('hash.txt', 'utf8').trim().split('\n');

  // Define an asynchronous function to process accounts with a delay
  const processAccounts = async () => {
    for (const queryId of queryIds) {
      await processAccount(queryId.trim());
      // Delay for 2 seconds between processing each account
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(chalk.green('--- All accounts processed. Waiting for 1 hour before the next run... ---'));
  };

  // Initial execution
  await processAccounts();

  // Set an interval to run the function every 1 hour (3600000 milliseconds)
  setInterval(async () => {
    console.log(chalk.blue('--- Starting new account processing cycle... ---'));
    await processAccounts();
  }, 3600000); // 1 hour
}

// Run the main function
main();
