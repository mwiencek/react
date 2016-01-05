/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getAncestorInfo
 */

'use strict';

var ReactNativeComponent = require('ReactNativeComponent');

function getAncestorInfo(nativeParent, nativeContainerInfo) {
  var parentInfo;
  if (nativeParent != null) {
    while (nativeParent) {
      if (nativeParent._nativeParent &&
          ReactNativeComponent.isFragmentComponent(nativeParent)) {
        nativeParent = nativeParent._nativeParent;
      } else {
        break;
      }
    }
    parentInfo = nativeParent._ancestorInfo;
  } else if (nativeContainerInfo._tag) {
    parentInfo = nativeContainerInfo._ancestorInfo;
  }
  return parentInfo;
}

module.exports = getAncestorInfo;
