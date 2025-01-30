
fabric.util.object.extend(fabric.IText.prototype, {
  caching: false,
  //added second parameter
  selectWord: function (selectionStart, selectionEnd) {
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
    this._fireSelectionChanged();
    this._updateTextarea();
    this.renderCursorOrSelection();
  },
  /**
   * Inserts style object(s)
   * @param {String} _chars Characters at the location where style is inserted
   * @param {Boolean} isEndOfLine True if it's end of line
   * @param {Object} [styleObject] Style to insert
   */
  insertStyleObjects: function (_chars, isEndOfLine, styleObject) {
    // removed shortcircuit over isEmptyStyles

    var cursorLocation = this.get2DCursorLocation(),
      lineIndex = cursorLocation.lineIndex,
      charIndex = cursorLocation.charIndex;

    if (!this._getLineStyle(lineIndex)) {
      this._setLineStyle(lineIndex, {});
    }

    if (_chars === '\n') {
      this.insertNewlineStyleObject(lineIndex, charIndex, isEndOfLine);
    }
    else {
      this.insertCharStyleObject(lineIndex, charIndex, styleObject);
    }
  },
  /**
   * Inserts characters where cursor is (replacing selection if one exists)
   * @param {String} _chars Characters to insert
   * @param {Boolean} useCopiedStyle use fabric.copiedTextStyle
   */
  insertChars: function (_chars, useCopiedStyle) {
    var style;

    if (this.selectionEnd - this.selectionStart > 1) {
      this._removeCharsFromTo(this.selectionStart, this.selectionEnd);
    }
    //short circuit for block paste
    if (!useCopiedStyle && this.isEmptyStyles()) {
      this.insertChar(_chars, false);
      return;
    }
    for (var i = 0, len = _chars.length; i < len; i++) {
      if (useCopiedStyle) {
        style = fabric.util.object.clone(fabric.copiedTextStyle[i], true);
      }
      this.insertChar(_chars[i], i < len - 1, style);
    }
  },

  /**
   * Inserts a character where cursor is
   * @param {String} _char Characters to insert
   * @param {Boolean} skipUpdate trigger rendering and updates at the end of text insert
   * @param {Object} styleObject Style to be inserted for the new char
   */
  insertChar: function (_char, skipUpdate, styleObject) {
    var isEndOfLine = this.text[this.selectionStart] === '\n';
    this.text = this.text.slice(0, this.selectionStart) +
      _char + this.text.slice(this.selectionEnd);
    this._textLines = this.text.split(this._reNewline);
    this.insertStyleObjects(_char, isEndOfLine, styleObject);
    this.selectionStart += _char.length;
    this.selectionEnd = this.selectionStart;
    if (skipUpdate) {
      return;
    }
    this._updateTextarea();
    this.setCoords();
    this._fireSelectionChanged();
    this.fire('changed');
    this.restartCursorIfNeeded();
    if (this.canvas) {
      this.canvas.fire('text:changed', { target: this });
      this.canvas.renderAll();
    }
  },

  /**
   * @private
   */
  _removeCharsFromTo: function (start, end) {
    while (end !== start) {
      this._removeSingleCharAndStyle(start + 1);
      end--;
    }
    this.selectionStart = start;
    this.selectionEnd = start;
  },

  _removeSingleCharAndStyle: function (index) {
    var isBeginningOfLine = this.text[index - 1] === '\n',
      indexStyle = isBeginningOfLine ? index : index - 1;
    this.removeStyleObject(isBeginningOfLine, indexStyle);
    this.text = this.text.slice(0, index - 1) +
      this.text.slice(index);

    this._textLines = this._splitTextIntoLines();
  },
});