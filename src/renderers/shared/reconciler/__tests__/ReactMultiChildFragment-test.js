/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

'use strict';

var React = require('React');
var testAllPermutations = require('testAllPermutations');

var expectChildren = function(container, children) {
  var childNodes = container.childNodes;
  var domID;
  var domIDs = [];

  expect(childNodes.length).toBe(children.length);

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var domNode = childNodes[i];

    if (child === null) {
      expect(domNode.nodeType).toBe(8);
      expect(domNode.nodeValue).toMatch(/ react-empty: [0-9]+ /);
    } else if (child === '<') {
      domID = domNode.nodeValue.match(/react-frag: ([0-9]+)/)[1];
      domIDs.push(domID);
      expect(domNode.nodeType).toBe(8);
      expect(domNode.nodeValue).toBe(' react-frag: ' + domID + ' ');
    } else if (child === '>') {
      domID = domIDs.pop();
      expect(domNode.nodeType).toBe(8);
      expect(domNode.nodeValue).toBe(' /react-frag: ' + domID + ' ');
    } else {
      expect(domNode.tagName).toBe('DIV');
      expect(domNode.textContent).toBe(child.props.children);
    }
  }
};

describe('ReactMultiChildFragment', function() {
  var Frag1 = React.createClass({
    render: function() {
      var id = this.props.id;
      switch (this.props.count) {
        case 0:
          return (
            <frag></frag>
          );
        case 1:
          return (
            <div>{id + '1'}</div>
          );
        case 2:
          return (
            <frag>
              <div>{id + '1'}</div>
              <div>{id + '2'}</div>
            </frag>
          );
        default:
          return null;
      }
    },
  });

  var Frag2 = React.createClass({
    render: function() {
      return (
        <frag>
          <frag>
            {this.props.a && <div>a</div>}
            {this.props.b && <div>b</div>}
            {this.props.c && <div>c</div>}
          </frag>
          <frag>
            {this.props.d && <div>d</div>}
            {this.props.e && <div>e</div>}
          </frag>
          <frag>
            {this.props.f && <div>f</div>}
          </frag>
        </frag>
      );
    },
  });

  function divs(text) {
    return text.map(function(t) {
      return <div>{t}</div>;
    });
  }

  it('should correctly handle all possible children for render and update', function() {
    var tests = [
      <Frag1 id="A" />, [null],
      <Frag1 id="A" count={0} />, ['<', '>'],
      <Frag1 id="A" count={1} />, [<div>A1</div>],
      <Frag1 id="A" count={2} />, ['<', <div>A1</div>, <div>A2</div>, '>'],

      <Frag1 id="B" />, [null],
      <Frag1 id="B" count={0} />, ['<', '>'],
      <Frag1 id="B" count={1} />, [<div>B1</div>],
      <Frag1 id="B" count={2} />, ['<', <div>B1</div>, <div>B2</div>, '>'],
    ];

    var count = tests.length;
    for (var i = 0; i < count; i += 2) {
      for (var j = i + 2; j < count; j += 2) {
        tests.push(
          <frag>
            {tests[i]}
            {tests[j]}
          </frag>,
          ['<'].concat(tests[i + 1], tests[j + 1], '>')
        );
      }
    }

    testAllPermutations(expectChildren, tests);

    var fragCombinations1 = [
      '000', [],
      '001', ['c'],
      '010', ['b'],
      '011', ['b', 'c'],
      '100', ['a'],
      '101', ['a', 'c'],
      '110', ['a', 'b'],
      '111', ['a', 'b', 'c'],
    ];

    var fragCombinations2 = [
      '00', [],
      '01', ['e'],
      '10', ['d'],
      '11', ['d', 'e'],
    ];

    var fragCombinations3 = [
      '0', [],
      '1', ['f'],
    ];

    var propNames = ['f', 'e', 'd', 'c', 'b', 'a'];
    tests = [];

    for (i = 0; i < fragCombinations1.length; i += 2) {
      for (j = 0; j < fragCombinations2.length; j += 2) {
        for (var k = 0; k < fragCombinations3.length; k += 2) {
          var mask = parseInt(fragCombinations1[i] +
                              fragCombinations2[j] +
                              fragCombinations3[k], 2);
          var props = {};
          for (var m = 0; m < propNames.length; m++) {
            props[propNames[m]] = !!(Math.pow(2, m) & mask);
          }
          tests.push(
            React.createElement(Frag2, props),
            [].concat('<',
                      '<', divs(fragCombinations1[i + 1]), '>',
                      '<', divs(fragCombinations2[j + 1]), '>',
                      '<', divs(fragCombinations3[k + 1]), '>',
                      '>')
          );
        }
      }
    }

    testAllPermutations(expectChildren, tests);
  });
});
