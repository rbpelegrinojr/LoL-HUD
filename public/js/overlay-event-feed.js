const feedEl = document.getElementById('event-feed');
const MAX_VISIBLE_EVENTS = 8;

let renderedEventCount = 0;

function renderEvent(event) {
  const item = document.createElement('div');
  item.className = `event-item ${event.type || ''}`.trim();
  item.textContent = event.message || JSON.stringify(event);
  feedEl.prepend(item);

  while (feedEl.children.length > MAX_VISIBLE_EVENTS) {
    feedEl.removeChild(feedEl.lastChild);
  }

  setTimeout(() => {
    item.style.transition = 'opacity 0.5s ease-out';
    item.style.opacity = '0';
    setTimeout(() => item.remove(), 500);
  }, 8000);
}

function renderNewEvents(events) {
  const newEvents = events.slice(renderedEventCount);
  newEvents.forEach(renderEvent);
  renderedEventCount = events.length;
}

const socket = io();

socket.on('hud:update', (state) => {
  if (state && Array.isArray(state.events)) {
    if (state.events.length < renderedEventCount) {
      renderedEventCount = 0;
    }
    renderNewEvents(state.events);
  }
});

socket.on('hud:end', () => {
  renderedEventCount = 0;
});
