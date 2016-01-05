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

var React;
var ReactDOM;
var ReactDOMServer;

describe('ReactDOMFragment', function() {
  beforeEach(function() {
    React = require('React');
    ReactDOM = require('ReactDOM');
    ReactDOMServer = require('ReactDOMServer');
  });

  it('can be passed directly to ReactDOM.render()', function() {
    var fragment = (
      <frag>
        <span>foo</span>
        <span>bar</span>
      </frag>
    );

    var mountPoint = document.createElement('div');
    var nodes = ReactDOM.render(fragment, mountPoint);

    expect(nodes[0].tagName).toBe('SPAN');
    expect(nodes[1].tagName).toBe('SPAN');
  });

  it('can be deeply nested', function() {
    var Frag = React.createClass({
      render: function() {
        return (
          <frag>
            <frag>
              <frag>foo</frag>
              <frag>bar</frag>
            </frag>
          </frag>
        );
      },
    });

    var mountPoint = document.createElement('div');
    ReactDOM.render(<Frag />, mountPoint);
    var childNodes = mountPoint.childNodes;

    expect(childNodes.length).toBe(14);
    expect(mountPoint.innerHTML).toBe(
      '<!-- react-frag: 1 -->' +
        '<!-- react-frag: 2 -->' +
          '<!-- react-frag: 3 -->' +
            '<!-- react-text: 4 -->foo<!-- /react-text -->' +
          '<!-- /react-frag: 3 -->' +
          '<!-- react-frag: 5 -->' +
            '<!-- react-text: 6 -->bar<!-- /react-text -->' +
          '<!-- /react-frag: 5 -->' +
        '<!-- /react-frag: 2 -->' +
      '<!-- /react-frag: 1 -->'
    );
  });

  it('can be reordered via key props', function() {
    var TableClass = React.createClass({
      render: function() {
        return (
          <table>
            <tbody>
              {this.props.items.map(function(item) {
                return (
                  <frag key={item.id}>
                    <tr>
                      <td>{item.name + ' (row 1)'}</td>
                    </tr>
                    <tr>
                      <td>{item.name + ' (row 2)'}</td>
                    </tr>
                  </frag>
                );
              })}
            </tbody>
          </table>
        );
      },
    });

    var items = [
      {id: 1, name: 'foo'},
      {id: 2, name: 'bar'},
    ];

    var mountPoint = document.createElement('div');
    var inst = ReactDOM.render(<TableClass items={items} />, mountPoint);
    var rows = ReactDOM.findDOMNode(inst).querySelectorAll('tr');

    expect(rows.length).toBe(4);

    var row1 = rows[0];
    var row2 = rows[1];
    var row3 = rows[2];
    var row4 = rows[3];

    expect(row1.textContent).toBe('foo (row 1)');
    expect(row2.textContent).toBe('foo (row 2)');
    expect(row3.textContent).toBe('bar (row 1)');
    expect(row4.textContent).toBe('bar (row 2)');

    items = [
      {id: 2, name: 'bar'},
      {id: 1, name: 'foo'},
    ];

    inst = ReactDOM.render(<TableClass items={items} />, mountPoint);
    rows = ReactDOM.findDOMNode(inst).querySelectorAll('tr');

    expect(rows.length).toBe(4);

    // same DOM nodes are present
    expect(rows[0]).toBe(row3);
    expect(rows[1]).toBe(row4);
    expect(rows[2]).toBe(row1);
    expect(rows[3]).toBe(row2);

    // text contents are unchanged
    expect(row1.textContent).toBe('foo (row 1)');
    expect(row2.textContent).toBe('foo (row 2)');
    expect(row3.textContent).toBe('bar (row 1)');
    expect(row4.textContent).toBe('bar (row 2)');
  });

  it('can have its children be reordered via key props', function() {
    var frag1 = (
      <frag>
        <span key={1}>foo</span>
        <span key={2}>bar</span>
        <span key={3}>baz</span>
      </frag>
    );

    var mountPoint = document.createElement('div');
    ReactDOM.render(frag1, mountPoint, function() {
      var span1 = this[0];
      var span2 = this[1];
      var span3 = this[2];

      var frag2 = (
        <frag>
          <span key={3}>baz</span>
          <span key={2}>bar</span>
          <span key={1}>foo</span>
        </frag>
      );

      ReactDOM.render(frag2, mountPoint, function() {
        expect(this.length).toBe(3);
        expect(this[0]).toBe(span3);
        expect(this[1]).toBe(span2);
        expect(this[2]).toBe(span1);
      });
    });
  });

  it('can render to a static string', function() {
    var frag = (
      <frag>
        <span>span1</span>
        <span>span2</span>
      </frag>
    );

    expect(ReactDOMServer.renderToStaticMarkup(frag)).toBe(
      '<!-- react-frag: 1 -->' +
        '<span>span1</span>' +
        '<span>span2</span>' +
      '<!-- /react-frag: 1 -->'
    );
  });

  it('warns of invalid DOM nestings', function() {
    spyOn(console, 'error');

    var Frag = React.createClass({
      render: function() {
        return (
          <table>
            <tbody>
              <tr>
                <frag>
                  test
                </frag>
                <frag>
                  <div>test</div>
                </frag>
              </tr>
            </tbody>
          </table>
        );
      },
    });

    ReactDOM.render(<Frag />, document.createElement('div'));

    expect(console.error.argsForCall.length).toBe(2);
    expect(console.error.argsForCall[0][0]).toContain(
      '#text cannot appear as a child of <tr>. See Frag > tr > #text.'
    );
    expect(console.error.argsForCall[1][0]).toContain(
      '<div> cannot appear as a child of <tr>. See Frag > tr > div.'
    );
  });

  it('warns of props other than key', function() {
    spyOn(console, 'error');

    ReactDOM.render(
      <frag className="foo" onClick={null}><div /></frag>,
      document.createElement('div')
    );

    expect(console.error.argsForCall.length).toBe(1);
    expect(console.error.argsForCall[0][0]).toContain(
      'Props other than `key` on <frag /> elements are ignored ' +
      '(found: className, onClick).'
    );
  });

  it('warns if findDOMNode() is called on a fragment component', function() {
    spyOn(console, 'error');

    var Frag = React.createClass({
      render: function() {
        return <frag><div /></frag>;
      },
    });

    var inst = ReactDOM.render(<Frag />, document.createElement('div'));

    ReactDOM.findDOMNode(inst);

    expect(console.error.argsForCall.length).toBe(1);
    expect(console.error.argsForCall[0][0]).toContain(
      'findDOMNode() will always return null for fragments.'
    );
  });
});
