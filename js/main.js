const newColor = document.querySelector('#clr-input');

// Settings
const separatorValues = document.querySelector('#separator-values');
const checkValues = separatorValues.querySelector('[type=checkbox]');
const choicesValues = separatorValues.querySelectorAll('.choice');

const separatorTrans = document.querySelector('#separator-trans');
const checkTrans = separatorTrans.querySelector('[type=checkbox]');
const choicesTrans = separatorTrans.querySelectorAll('.choice');

const checkForceTrans = document.querySelector('#force-trans');
const checkPercentages = document.querySelector('#rgb-perc');
const checkDegrees = document.querySelector('#hsl-deg');

window.addEventListener("load", e => {
  checkValues.addEventListener('change', e => {
    if (e.target.checked) {
      choicesValues[0].classList.remove('disabled');
      choicesValues[1].classList.add('disabled');
    } else {
      choicesValues[0].classList.add('disabled');
      choicesValues[1].classList.remove('disabled');
    }
  });

  checkTrans.addEventListener('change', e => {
    if (e.target.checked) {
      choicesTrans[0].classList.remove('disabled');
      choicesTrans[1].classList.add('disabled');
    } else {
      choicesTrans[0].classList.add('disabled');
      choicesTrans[1].classList.remove('disabled');
    }
  });

  checkForceTrans.addEventListener('change', e => {
    console.log('Force transparency: ', e.target.checked)
  })

  checkPercentages.addEventListener('change', e => {
    console.log('Force %: ', e.target.checked)
  })

  checkDegrees.addEventListener('change', e => {
    console.log('Force Degrees: ', e.target.checked)
  })
});


// const copyToClipboard = (str) => {
//     const el = document.createElement('textarea');  // Create a <textarea> element
//     el.value = str;                                 // Set its value to the string that you want copied
//     // el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
//     // el.style.position = 'absolute';                 
//     // el.style.left = '-9999px';                      // Move outside the screen to make it invisible
//     document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
//     const selected =            
//       document.getSelection().rangeCount > 0        // Check if there is any content selected previously
//         ? document.getSelection().getRangeAt(0)     // Store selection if found
//         : false;                                    // Mark as false to know no selection existed before
//     el.select();                                    // Select the <textarea> content
//     document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
//     console.log(">>>>Yes!!", str)
//     document.body.removeChild(el);                  // Remove the <textarea> element
//     if (selected) {                                 // If a selection existed before copying
//       document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
//       document.getSelection().addRange(selected);   // Restore the original selection
//     }
//   };

const copyToClipboard = (ev) => {
  const el = document.createElement('textarea'); // Create a <textarea> element
  el.value = rgbVal.value; // Set its value to the string that you want copied
  // el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  // el.style.position = 'absolute';                 
  // el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el); // Append the <textarea> element to the HTML document
  const selected =
    document.getSelection().rangeCount > 0 // Check if there is any content selected previously
    ?
    document.getSelection().getRangeAt(0) // Store selection if found
    :
    false; // Mark as false to know no selection existed before
  el.select(); // Select the <textarea> content
  document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
  console.log(">>>>Yes!!", rgbVal.value)
  document.body.removeChild(el); // Remove the <textarea> element
  if (selected) { // If a selection existed before copying
    document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
    document.getSelection().addRange(selected); // Restore the original selection
  }
};


window.addEventListener("load", e => {
  newColor.addEventListener('change', e => {
    console.log("une nouvelle couleur !");
    let clr = new MyColor(e.target.value);
  });

  const copyBtns = document.querySelectorAll('.copy');
  copyBtns.forEach(b => {
    b.addEventListener('click', e => {
      const parent = e.target.parentElement;
      const field = parent.querySelector('input[type=text]');
      console.log(field.value);
    })
  })
  // copyBtn.addEventListener('click', _ => {
  //     const el = document.createElement('textarea');  // Create a <textarea> element
  //     el.value = rgbVal.value;                                 // Set its value to the string that you want copied
  //     // el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  //     // el.style.position = 'absolute';                 
  //     // el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  //     document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  //     const selected =            
  //       document.getSelection().rangeCount > 0        // Check if there is any content selected previously
  //         ? document.getSelection().getRangeAt(0)     // Store selection if found
  //         : false;                                    // Mark as false to know no selection existed before
  //     el.select();                                    // Select the <textarea> content
  //     document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  //     console.log(">>>>Yes!!", rgbVal.value)
  //     document.body.removeChild(el);                  // Remove the <textarea> element
  //     if (selected) {                                 // If a selection existed before copying
  //       document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
  //       document.getSelection().addRange(selected);   // Restore the original selection
  //     }
  //   });
  // copyBtn.addEventListener('click', copyToClipboard);
});