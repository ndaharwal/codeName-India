
fabric.util.object.extend(fabric.Text.prototype, {
  defaultCharWidth: 0.1999969482421875,
  _measureChar: function (_char, charStyle, previousChar, prevCharStyle) {
    // first i try to return from cache
    var fontCache = this.getFontCache(charStyle), fontDeclaration = this._getFontDeclaration(charStyle),
      previousFontDeclaration = this._getFontDeclaration(prevCharStyle), couple = previousChar + _char,
      stylesAreEqual = fontDeclaration === previousFontDeclaration, width, coupleWidth, previousWidth,
      fontMultiplier = charStyle.fontSize / this.CACHE_FONT_SIZE, kernedWidth;

    if (previousChar && fontCache[previousChar] !== undefined) {
      previousWidth = fontCache[previousChar];
    }
    if (fontCache[_char] !== undefined) {
      kernedWidth = width = fontCache[_char];
    }
    if (stylesAreEqual && fontCache[couple] !== undefined) {
      coupleWidth = fontCache[couple];
      kernedWidth = coupleWidth - previousWidth;
    }
    if (width === undefined || previousWidth === undefined || coupleWidth === undefined) {
      var ctx = this.getMeasuringContext();
      // send a TRUE to specify measuring font size CACHE_FONT_SIZE
      this._setTextStyles(ctx, charStyle, true);
    }
    if (width === undefined) {
      kernedWidth = width = ctx.measureText(_char).width;

      //modified: if character width zero, then set default width.
      if (!width) {
        kernedWidth = width = this.defaultCharWidth;
      }
      fontCache[_char] = width;
    }
    if (previousWidth === undefined && stylesAreEqual && previousChar) {
      previousWidth = ctx.measureText(previousChar).width;
      fontCache[previousChar] = previousWidth;
    }
    if (stylesAreEqual && coupleWidth === undefined) {
      // we can measure the kerning couple and subtract the width of the previous character
      coupleWidth = ctx.measureText(couple).width;
      fontCache[couple] = coupleWidth;
      kernedWidth = coupleWidth - previousWidth;
    }
    return {width: width * fontMultiplier, kernedWidth: kernedWidth * fontMultiplier};
  }
});