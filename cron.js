const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);



async function archiveOldTasks() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const { data: oldTasks, error: fetchError } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .lt('run_at', cutoffDate.toISOString());

  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  if (!oldTasks.length) {
    console.log('No old tasks to archive.');
    return;
  }

  const { error: insertError } = await supabase
    .from('archived_tasks')
    .insert(oldTasks);

  if (insertError) {
    console.error('Insert error:', insertError);
    return;
  }

  const { error: deleteError } = await supabase
    .from('scheduled_tasks')
    .delete()
    .lt('run_at', cutoffDate.toISOString());

  if (deleteError) {
    console.error('Delete error:', deleteError);
    return;
  }

  console.log(`${oldTasks.length} tasks archived and deleted.`);
}

async function flagStaleTasks() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60);

  const { error } = await supabase
    .from('scheduled_tasks')
    .update({ is_done: true }) // or you can add is_stale column and update that instead
    .lt('last_updated', cutoffDate.toISOString());

  if (error) {
    console.error('Flag stale error:', error);
  } else {
    console.log('Stale tasks flagged.');
  }
}

function calculateScore(task) {
  return task.is_done ? 0 : Math.max(0, 100 - ((new Date(task.run_at) - new Date()) / (1000 * 3600 * 24)));
}

async function recalculateScores() {
  const { data: tasks, error } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('is_done', false);

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  for (const task of tasks) {
    const newScore = calculateScore(task);

    const { error: updateError } = await supabase
      .from('scheduled_tasks')
      .update({ priority_score: newScore })
      .eq('id', task.id);

    if (updateError) {
      console.error('Update error:', updateError);
    }
  }
  console.log('Scores recalculated.');
}

async function removeDuplicates() {
  const { data: tasks, error } = await supabase
    .from('scheduled_tasks')
    .select('id, title');

  if (error) {
    console.error(error);
    return;
  }

  const seen = new Set();
  const duplicates = [];

  for (const task of tasks) {
    if (seen.has(task.title)) {
      duplicates.push(task.id);
    } else {
      seen.add(task.title);
    }
  }

  if (duplicates.length > 0) {
    const { error: deleteError } = await supabase
      .from('scheduled_tasks')
      .delete()
      .in('id', duplicates);

    if (deleteError) {
      console.error('Delete duplicates error:', deleteError);
    } else {
      console.log(`${duplicates.length} duplicate tasks deleted.`);
    }
  } else {
    console.log('No duplicates found.');
  }
}

async function runMaintenance() {
  console.log('Starting maintenance...');
  await archiveOldTasks();
  await flagStaleTasks();
  await recalculateScores();
  await removeDuplicates();
  console.log('Maintenance complete.');
}

runMaintenance();
