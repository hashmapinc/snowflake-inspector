
$('form').submit(function (e) {
  e.preventDefault();
  $('#createModal').modal('toggle');
  let text = $('textarea#result').val();
  render(JSON.parse(text));
});

// copy the query to clipboard
const writeBtn = document.querySelector('.write-btn');
const inputEl = document.querySelector('.to-copy').firstChild;

writeBtn.addEventListener('click', () => {
  const inputValue = inputEl.data;
  if (inputValue) {
    navigator.clipboard
      .writeText(inputValue)
      .then(() => {
        if (writeBtn.innerText !== 'Copied!') {
          const originalText = writeBtn.innerText;
          writeBtn.innerText = 'Copied!';
          setTimeout(() => {
            writeBtn.innerText = originalText;
          }, 1500);
        }
      })
      .catch((err) => {
        console.log('Something went wrong', err);
      });
  }
});