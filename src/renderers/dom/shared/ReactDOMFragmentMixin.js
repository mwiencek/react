/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMFragmentMixin
 */

'use strict';

var ReactDOMComponentTree = require('ReactDOMComponentTree');
var invariant = require('invariant');

var ReactDOMFragmentMixin = {

  getNativeNode: function() {
    var nativeNode = this._commentNodes;
    if (nativeNode) {
      return nativeNode;
    }
    if (!this._closingComment) {
      var openingComment = ReactDOMComponentTree.getNodeFromInstance(this);
      var node = openingComment.nextSibling;
      var closingValue = ' /' + this._commentID + ' ';
      while (true) {
        invariant(
          node != null,
          'Missing closing comment for component %s',
          this._domID
        );
        if (node.nodeType === 8 && node.nodeValue === closingValue) {
          this._closingComment = node;
          break;
        }
        node = node.nextSibling;
      }
    }
    nativeNode = [this._nativeNode, this._closingComment];
    this._commentNodes = nativeNode;
    return nativeNode;
  },

  unmountComponent: function() {
    this._closingComment = null;
    this._commentNodes = null;
    ReactDOMComponentTree.uncacheNode(this);
  },
};

module.exports = ReactDOMFragmentMixin;
