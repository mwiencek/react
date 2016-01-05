/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule findDOMNode
 */

'use strict';

var ReactCurrentOwner = require('ReactCurrentOwner');
var ReactDOMComponentTree = require('ReactDOMComponentTree');
var ReactInstanceMap = require('ReactInstanceMap');
var ReactNativeComponent = require('ReactNativeComponent');

var getNativeComponentFromComposite = require('getNativeComponentFromComposite');
var invariant = require('invariant');
var warning = require('warning');

function fragmentWarning() {
  warning(
    false,
    'findDOMNode() will always return null for fragments. Use refs to ' +
    'access a specific node in the fragment, or call findDOMNode() on ' +
    'the parent instead.'
  );
}

/**
 * Returns the DOM node rendered by this element.
 *
 * @param {ReactComponent|DOMElement} componentOrElement
 * @return {?DOMElement} The root node of this element.
 */
function findDOMNode(componentOrElement) {
  if (__DEV__) {
    var owner = ReactCurrentOwner.current;
    if (owner !== null) {
      warning(
        owner._warnedAboutRefsInRender,
        '%s is accessing findDOMNode inside its render(). ' +
        'render() should be a pure function of props and state. It should ' +
        'never access something that requires stale data from the previous ' +
        'render, such as refs. Move this logic to componentDidMount and ' +
        'componentDidUpdate instead.',
        owner.getName() || 'A component'
      );
      owner._warnedAboutRefsInRender = true;
    }
  }
  if (componentOrElement == null) {
    return null;
  }
  if (componentOrElement.nodeType === 1) {
    return componentOrElement;
  }

  if (ReactNativeComponent.isFragmentComponent(componentOrElement)) {
    if (__DEV__) {
      fragmentWarning();
    }
    return null;
  }

  var inst = ReactInstanceMap.get(componentOrElement);
  if (inst) {
    inst = getNativeComponentFromComposite(inst);
    if (inst) {
      if (inst._currentElement.type === 'frag') {
        if (__DEV__) {
          fragmentWarning();
        }
        return null;
      }
      return ReactDOMComponentTree.getNodeFromInstance(inst);
    }
    return null;
  }

  if (typeof componentOrElement.render === 'function') {
    invariant(
      false,
      'findDOMNode was called on an unmounted component.'
    );
  } else {
    invariant(
      false,
      'Element appears to be neither ReactComponent nor DOMNode (keys: %s)',
      Object.keys(componentOrElement)
    );
  }
}

module.exports = findDOMNode;
