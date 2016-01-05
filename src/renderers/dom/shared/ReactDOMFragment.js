/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMFragment
 */

'use strict';

var DOMLazyTree = require('DOMLazyTree');
var ReactDOMComponentTree = require('ReactDOMComponentTree');
var ReactDOMFragmentMixin = require('ReactDOMFragmentMixin');
var ReactMultiChild = require('ReactMultiChild');
var ReactNativeComponent = require('ReactNativeComponent');
var ReactPerf = require('ReactPerf');

var warning = require('warning');

function getAllFragmentChildren(inst, accum) {
  if (ReactNativeComponent.isFragmentComponent(inst)) {
    var children = inst._renderedChildren;
    for (var name in children) {
      getAllFragmentChildren(children[name], accum);
    }
  } else {
    accum.push(inst.getPublicInstance());
  }
  return accum;
}

function assertValidProps(props) {
  if (!props) {
    return;
  }
  var invalidProps = [];
  for (var name in props) {
    if (name !== 'key' && name !== 'children') {
      invalidProps.push(name);
    }
  }
  warning(
    !invalidProps.length,
    'Props other than `key` on <frag /> elements are ignored (found: %s).',
    invalidProps.join(', ')
  );
}

/**
 * @class ReactDOMFragment
 * @extends ReactComponent
 * @internal
 */
var ReactDOMFragment = function(element) {
  // ReactDOMComponentTree uses these:
  this._nativeNode = null;
  this._nativeParent = null;
  this._nativeContainerInfo = null;

  this._topLevelWrapper = null;
  this._renderedChildren = null;
  this._renderedComponent = null;

  // Properties
  this._currentElement = element;
  this._domID = null;
  this._closingComment = null;
  this._commentNodes = null;
};

Object.assign(ReactDOMFragment.prototype, ReactMultiChild.Mixin, ReactDOMFragmentMixin, {

  _commentID: 'react-frag',

  /**
   * @internal
   */
  mountComponent: function(
    transaction,
    nativeParent,
    nativeContainerInfo,
    context
  ) {
    assertValidProps(this._currentElement.props);

    var domID = nativeContainerInfo._idCounter++;
    var openingValue = ' react-frag: ' + domID + ' ';
    var closingValue = ' /react-frag: ' + domID + ' ';
    this._domID = domID;
    this._nativeParent = nativeParent;
    this._nativeContainerInfo = nativeContainerInfo;
    var mountImages = this.mountChildren(
      this._currentElement.props.children,
      transaction,
      context
    );
    if (transaction.useCreateElement) {
      var ownerDocument = nativeContainerInfo._ownerDocument;
      var openingComment = ownerDocument.createComment(openingValue);
      var closingComment = ownerDocument.createComment(closingValue);
      var lazyTree = DOMLazyTree(ownerDocument.createDocumentFragment());
      DOMLazyTree.queueChild(lazyTree, DOMLazyTree(openingComment));
      for (var i = 0; i < mountImages.length; i++) {
        DOMLazyTree.queueChild(lazyTree, mountImages[i]);
      }
      DOMLazyTree.queueChild(lazyTree, DOMLazyTree(closingComment));
      ReactDOMComponentTree.precacheNode(this, openingComment);
      this._closingComment = closingComment;
      return lazyTree;
    } else {
      return (
        '<!--' + openingValue + '-->' + mountImages.join('') +
        '<!--' + closingValue + '-->'
      );
    }
  },

  /**
   * @internal
   */
  receiveComponent: function(nextElement, transaction, context) {
    this._currentElement = nextElement;

    assertValidProps(nextElement.props);

    this._updateChildren(
      nextElement.props.children,
      transaction,
      context
    );
  },

  getPublicInstance: function() {
    return getAllFragmentChildren(this, []);
  },

  _processChildContext: function(context) {
    return context;
  },
});

ReactPerf.measureMethods(
  ReactDOMFragment.prototype,
  'ReactDOMFragment',
  {
    mountComponent: 'mountComponent',
    receiveComponent: 'receiveComponent',
  }
);

module.exports = ReactDOMFragment;
