/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule testAllPermutations
 */

'use strict';

var React = require('React');
var ReactDOM = require('ReactDOM');

function testAllPermutations(expectChildren, testCases) {
  for (var i = 0; i < testCases.length; i += 2) {
    var renderWithChildren = testCases[i];
    var expectedResultAfterRender = testCases[i + 1];

    for (var j = 0; j < testCases.length; j += 2) {
      var updateWithChildren = testCases[j];
      var expectedResultAfterUpdate = testCases[j + 1];

      var container = document.createElement('div');
      ReactDOM.render(<div>{renderWithChildren}</div>, container);
      expectChildren(container.firstChild, expectedResultAfterRender);

      ReactDOM.render(<div>{updateWithChildren}</div>, container);
      expectChildren(container.firstChild, expectedResultAfterUpdate);
    }
  }
}

module.exports = testAllPermutations;
