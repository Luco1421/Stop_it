function animatePlaceholder(input, placeholderText) {
  let index = 0;

  function animate() {
    index++;
    const slicedText = placeholderText.slice(0, index);
    input.placeholder = slicedText;
    if (index === placeholderText.length) {
      setTimeout(() => {
        index -= 2;
        animate();
      }, 600);
    } else {
      setTimeout(animate, 200);
    }
  }

  animate();
}

const input1 = document.getElementById('floatingInput');
const placeholderText1 = 'Ingrese su nombre: |';
animatePlaceholder(input1, placeholderText1);

const input2 = document.getElementById('floatingInput2');
const placeholderText2 = 'Nombrar sala: |';
animatePlaceholder(input2, placeholderText2);

const input3 = document.getElementById('floatingInput3');
const placeholderText3 = 'Ingrese código: |';
animatePlaceholder(input3, placeholderText3);
