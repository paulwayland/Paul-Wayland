// Demo data used when network requests fail
const sampleBills = [
  {
    id: 'c-1',
    title: 'Bill C-1: Modernization of Parliament Act',
    url: 'https://www.parl.ca/DocumentViewer/en/123',
    summary: 'An act to modernize parliamentary procedures and increase transparency.',
    highlights: [
      { section: 'Preamble', text: 'Emphasizes the commitment to open government and citizen engagement.' },
      { section: 'Section 5', text: 'Introduces digital tools for easier access to debates and documents.' }
    ]
  },
  {
    id: 'c-2',
    title: 'Bill C-2: Climate Accountability Act',
    url: 'https://www.parl.ca/DocumentViewer/en/456',
    summary: 'Legislation establishing annual climate targets and reporting requirements.',
    highlights: [
      { section: 'Section 3', text: 'Sets ambitious emission reduction goals for the next decade.' },
      { section: 'Section 8', text: 'Mandates regular progress reports to Parliament.' }
    ]
  }
];

// Attempt to fetch latest bills from an API; fall back to sample data
async function fetchBills() {
  try {
    const response = await fetch('https://example.com/api/bills');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Using sample bills due to fetch error:', e);
  }
  return sampleBills;
}

const COMMENT_KEY = 'bill-comments';
const VOTE_KEY = 'bill-votes';

function loadComments() {
  return JSON.parse(localStorage.getItem(COMMENT_KEY)) || {};
}

function saveComments(comments) {
  localStorage.setItem(COMMENT_KEY, JSON.stringify(comments));
}

function loadVotes() {
  return JSON.parse(localStorage.getItem(VOTE_KEY)) || {};
}

function saveVotes(votes) {
  localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
}

function registerVote(billId, type) {
  const votes = loadVotes();
  if (!votes[billId]) votes[billId] = { up: 0, down: 0 };
  votes[billId][type]++;
  saveVotes(votes);
  return votes[billId];
}

function addComment(billId, text) {
  const comments = loadComments();
  if (!comments[billId]) comments[billId] = [];
  comments[billId].push(text);
  saveComments(comments);
}

function renderBills(bills) {
  const container = document.getElementById('bill-list');
  if (!container) return;
  container.innerHTML = '';
  const comments = loadComments();

  bills.forEach(bill => {
    const div = document.createElement('div');
    div.className = 'bill';

    const currentVotes = loadVotes()[bill.id] || { up: 0, down: 0 };

    const title = document.createElement('h3');
    const link = document.createElement('a');
    link.href = bill.url;
    link.target = '_blank';
    link.textContent = bill.title;
    title.appendChild(link);
    div.appendChild(title);

    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.textContent = bill.summary;
    div.appendChild(summary);

    const highlightList = document.createElement('ul');
    highlightList.className = 'highlights';
    bill.highlights.forEach(h => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${h.section}:</strong> ${h.text}`;
      highlightList.appendChild(item);
    });
    div.appendChild(highlightList);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const viewLink = document.createElement('a');
    viewLink.href = bill.url;
    viewLink.target = '_blank';
    viewLink.textContent = 'View Bill';
    viewLink.className = 'view-btn';

    const upBtn = document.createElement('button');
    upBtn.className = 'vote-btn';
    upBtn.textContent = `\uD83D\uDC4D ${currentVotes.up}`;
    upBtn.addEventListener('click', () => {
      const v = registerVote(bill.id, 'up');
      upBtn.textContent = `\uD83D\uDC4D ${v.up}`;
      downBtn.textContent = `\uD83D\uDC4E ${v.down}`;
    });

    const downBtn = document.createElement('button');
    downBtn.className = 'vote-btn';
    downBtn.textContent = `\uD83D\uDC4E ${currentVotes.down}`;
    downBtn.addEventListener('click', () => {
      const v = registerVote(bill.id, 'down');
      upBtn.textContent = `\uD83D\uDC4D ${v.up}`;
      downBtn.textContent = `\uD83D\uDC4E ${v.down}`;
    });

    actions.appendChild(viewLink);
    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    div.appendChild(actions);

    const commentSec = document.createElement('div');
    commentSec.className = 'comments';

    const cTitle = document.createElement('h4');
    cTitle.textContent = 'Comments';
    commentSec.appendChild(cTitle);

    const commentList = document.createElement('ul');
    commentList.className = 'comment-list';
    (comments[bill.id] || []).forEach(c => {
      const li = document.createElement('li');
      li.textContent = c;
      commentList.appendChild(li);
    });
    commentSec.appendChild(commentList);

    const form = document.createElement('form');
    form.className = 'comment-form';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Your comment';
    input.required = true;
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.textContent = 'Add Comment';
    form.appendChild(input);
    form.appendChild(btn);
    form.addEventListener('submit', e => {
      e.preventDefault();
      addComment(bill.id, input.value.trim());
      input.value = '';
      renderBills(bills);
    });
    commentSec.appendChild(form);

    div.appendChild(commentSec);
    container.appendChild(div);
  });
}

function renderResults(bills) {
  const container = document.getElementById('results-list');
  if (!container) return;
  container.innerHTML = '';
  const votes = loadVotes();
  bills.forEach(bill => {
    const div = document.createElement('div');
    div.className = 'bill';
    const title = document.createElement('h3');
    title.textContent = bill.title;
    div.appendChild(title);
    const v = votes[bill.id] || { up: 0, down: 0 };
    const p = document.createElement('p');
    p.textContent = `\uD83D\uDC4D ${v.up}  \uD83D\uDC4E ${v.down}`;
    div.appendChild(p);
    container.appendChild(div);
  });
}

async function init() {
  const bills = await fetchBills();
  renderBills(bills);
  renderResults(bills);
}

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', () => {
  const yes = document.getElementById('yes-button');
  const no = document.getElementById('no-button');
  const modal = document.getElementById('vote-modal');
  const close = document.getElementById('close-modal');
  if (yes && no && modal && close) {
    const show = () => modal.classList.remove('hidden');
    yes.addEventListener('click', show);
    no.addEventListener('click', show);
    close.addEventListener('click', () => modal.classList.add('hidden'));
  }
});
