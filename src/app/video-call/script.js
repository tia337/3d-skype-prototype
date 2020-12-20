const blockDefaultSize = 250;
  let maxInvisibleBlockSize = blockDefaultSize;

  const sizeRange = document.getElementById('size-range');
  const distanceRange = document.getElementById('distance-range');
  const blocks = document.getElementsByClassName('video-block');
  const videoBlocks = [];
  let invisibleBlock;
  Array.prototype.slice.call(blocks, 0).map(block => {
      if (block.id === 'invisible-block') invisibleBlock = block;
      else videoBlocks.push(block)
  });


  sizeRange.addEventListener('input', (e) => {
      maxInvisibleBlockSize = blockDefaultSize + (1 - e.target.value / 100) * 2 * blockDefaultSize;
      const size = blockDefaultSize * e.target.value / 100;
      videoBlocks.forEach(block => block.setAttribute('style', `width: ${size}px; height: ${size}px;`));

      if (size < blockDefaultSize) distanceRange.setAttribute('class', 'slider');
      else distanceRange.setAttribute('class', 'slider slider-disabled');

      const invisibleBlockWidth = parseFloat(invisibleBlock.style.width);
      if (invisibleBlockWidth < size) {
          invisibleBlock.setAttribute('style', `width: ${size}px; height: ${size}px;`);
      } else if (invisibleBlockWidth > maxInvisibleBlockSize) {
          invisibleBlock.setAttribute(
              'style',
              `width: ${maxInvisibleBlockSize}px; height: ${maxInvisibleBlockSize}px;`
          );
      }
  });

  sizeRange.addEventListener('change', (e) => {
      const invisibleBlockWidth = parseFloat(invisibleBlock.style.width);
      distanceRange.setAttribute('min', e.target.value * blockDefaultSize / maxInvisibleBlockSize);
      distanceRange.value = 100 * invisibleBlockWidth / maxInvisibleBlockSize;
  });

  distanceRange.addEventListener('input', (e) => {
      const size = maxInvisibleBlockSize * e.target.value / 100;
      invisibleBlock.setAttribute('style', `width: ${size}px; height: ${size}px;`);
  });