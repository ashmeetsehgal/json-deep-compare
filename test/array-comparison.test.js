const JSONCompare = require('../src'); // Adjust path as needed
const { Result } = require('../src/Result'); // For type checking if needed

describe('Array Comparison Strategies', () => {
  describe('Set Strategy Tests', () => {
    test('should match identical sets of primitive numbers', () => {
      const obj1 = { arr: [1, 2, 3] };
      const obj2 = { arr: [3, 1, 2] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should match identical sets of primitive strings', () => {
      const obj1 = { arr: ['a', 'b', 'c'] };
      const obj2 = { arr: ['c', 'a', 'b'] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should report unmatched elements in sets of primitives', () => {
      const obj1 = { arr: [1, 2, 3] };
      const obj2 = { arr: [1, 2, 4] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2); // 3 is missing, 4 is extra (or counts differ)
      // Check specific messages based on Comparator.js
      const mismatch1 = result.unmatched.values.find(v => v.expected.includes("Element '3' count: 1"));
      const mismatch2 = result.unmatched.values.find(v => v.actual.includes("Element '4' count: 1"));
      expect(mismatch1).toBeDefined();
      expect(mismatch2).toBeDefined();
    });

    test('should report length mismatch for sets of different lengths', () => {
      const obj1 = { arr: [1, 2, 3] };
      const obj2 = { arr: [1, 2] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1);
      expect(result.unmatched.values[0].path).toBe('arr');
      expect(result.unmatched.values[0].message).toContain('Array lengths do not match for set comparison');
      expect(result.unmatched.values[0].expected).toBe('Array of length 3');
      expect(result.unmatched.values[0].actual).toBe('Array of length 2');
    });

    test('should match sets with duplicate primitives but same counts', () => {
      const obj1 = { arr: [1, 2, 2, 3] };
      const obj2 = { arr: [3, 2, 1, 2] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should report count mismatch for sets with duplicate primitives but different counts', () => {
      const obj1 = { arr: [1, 2, 2, 3] }; // 2 appears twice
      const obj2 = { arr: [1, 2, 3, 3] }; // 3 appears twice
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2);
      const mismatchFor2 = result.unmatched.values.find(v => v.message.includes("Element '2'"));
      const mismatchFor3 = result.unmatched.values.find(v => v.message.includes("Element '3'"));
      expect(mismatchFor2.expected).toBe("Element '2' count: 2");
      expect(mismatchFor2.actual).toBe("Element '2' count: 1");
      expect(mismatchFor3.expected).toBe("Element '3' count: 1");
      expect(mismatchFor3.actual).toBe("Element '3' count: 2");
    });
    
    test('should match identical sets of simple objects', () => {
      const obj1 = { arr: [{ a: 1 }, { b: 2 }] };
      const obj2 = { arr: [{ b: 2 }, { a: 1 }] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should report unmatched elements in sets of objects', () => {
      const obj1 = { arr: [{ a: 1 }, { b: 2 }] };
      const obj2 = { arr: [{ a: 1 }, { c: 3 }] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2); // one for {b:2}, one for {c:3}
      const keyB = JSON.stringify({ b: 2 });
      const keyC = JSON.stringify({ c: 3 });
      const mismatchB = result.unmatched.values.find(v => v.expected.includes(`Element '${keyB}' count: 1`));
      const mismatchC = result.unmatched.values.find(v => v.actual.includes(`Element '${keyC}' count: 1`));
      expect(mismatchB).toBeDefined();
      expect(mismatchC).toBeDefined();
    });

    test('should report length mismatch for sets of objects', () => {
        const obj1 = { arr: [{ a: 1 }, { b: 2 }] };
        const obj2 = { arr: [{ a: 1 }] };
        const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
        const comparer = new JSONCompare(options);
        const result = comparer.compare(obj1, obj2);
        expect(result.summary.matchPercentage).not.toBe(100);
        expect(result.unmatched.values.length).toBe(1);
        expect(result.unmatched.values[0].path).toBe('arr');
        expect(result.unmatched.values[0].message).toContain('Array lengths do not match for set comparison');
    });

    test('should match empty arrays with set strategy', () => {
      const obj1 = { arr: [] };
      const obj2 = { arr: [] };
      const options = { arrayComparisonStrategies: { 'arr': { type: 'set' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('set strategy with ignoredKeys in objects', () => {
      const obj1 = { arr: [{ id: 1, name: 'foo', ignored: 'val1'}] };
      const obj2 = { arr: [{ id: 1, name: 'foo', ignored: 'val2'}] };
      const options = { 
        ignoredKeys: ['ignored'],
        arrayComparisonStrategies: { 'arr': { type: 'set' } } 
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // Objects become effectively {id:1, name:'foo'} for comparison.
      // Since these are identical, the sets should match.
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('set strategy with different objects when an ignoredKey makes them appear the same', () => {
      const obj1 = { arr: [{ id: 1, name: 'foo', data: 'unique1', ignored: 'val1'}] };
      const obj2 = { arr: [{ id: 1, name: 'foo', data: 'unique2', ignored: 'val2'}] };
      const options = { 
        ignoredKeys: ['ignored'], // 'data' is NOT ignored
        arrayComparisonStrategies: { 'arr': { type: 'set' } } 
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // Objects are {id:1,name:'foo',data:'unique1'} vs {id:1,name:'foo',data:'unique2'}
      // These are different, so the sets should not match.
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2); 
      const key1 = JSON.stringify({ id: 1, name: 'foo', data: 'unique1' });
      const key2 = JSON.stringify({ id: 1, name: 'foo', data: 'unique2' });
      const mismatch1 = result.unmatched.values.find(v => v.expected.includes(`Element '${key1}' count: 1`));
      const mismatch2 = result.unmatched.values.find(v => v.actual.includes(`Element '${key2}' count: 1`));
      expect(mismatch1).toBeDefined();
      expect(mismatch2).toBeDefined();
    });
  });

  describe('Key Strategy Tests', () => {
    test('should match arrays of objects with unique IDs, same order, identical objects', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const obj2 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should match arrays of objects with unique IDs, different order, identical objects', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const obj2 = { items: [{ id: 2, val: 20 }, { id: 1, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('should report differences within keyed objects', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const obj2 = { items: [{ id: 1, val: 11 }, { id: 2, val: 20 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1);
      expect(result.unmatched.values[0].path).toBe('items[id=1].val');
      expect(result.unmatched.values[0].expected).toBe(10);
      expect(result.unmatched.values[0].actual).toBe(11);
    });

    test('should report missing element by key', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const obj2 = { items: [{ id: 1, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1);
      expect(result.unmatched.values[0].path).toBe('items[id=2]');
      expect(result.unmatched.values[0].expected).toEqual({ id: 2, val: 20 });
      expect(result.unmatched.values[0].actual).toBeUndefined();
      expect(result.unmatched.values[0].message).toContain("Element with key '2' exists in first array at path 'items' but not in second");
    });

    test('should report extra element by key', () => {
      const obj1 = { items: [{ id: 1, val: 10 }] };
      const obj2 = { items: [{ id: 1, val: 10 }, { id: 2, val: 20 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1);
      expect(result.unmatched.values[0].path).toBe('items[id=2]');
      expect(result.unmatched.values[0].expected).toBeUndefined();
      expect(result.unmatched.values[0].actual).toEqual({ id: 2, val: 20 });
      expect(result.unmatched.values[0].message).toContain("Element with key '2' exists in second array at path 'items' but not in first");
    });

    test('should report unkeyable elements (key missing)', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { name: 'no_id', val: 30 }] }; // second item missing 'id'
      const obj2 = { items: [{ id: 1, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1); // For the unkeyable element
      expect(result.unmatched.values[0].path).toBe('items[1]'); // Path to the unkeyable element by index
      expect(result.unmatched.values[0].expected).toEqual({ name: 'no_id', val: 30 });
      expect(result.unmatched.values[0].actual).toContain("Unkeyable (key: 'id')");
      expect(result.unmatched.values[0].message).toContain("Element at index 1 in first array at path 'items' is not an object or is missing the key 'id'");
    });
    
    test('should report unkeyable elements (not an object)', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, "not_an_object"] }; 
      const obj2 = { items: [{ id: 1, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(1); 
      expect(result.unmatched.values[0].path).toBe('items[1]');
      expect(result.unmatched.values[0].expected).toBe("not_an_object");
      expect(result.unmatched.values[0].actual).toContain("Unkeyable (key: 'id')");
      expect(result.unmatched.values[0].message).toContain("Element at index 1 in first array at path 'items' is not an object or is missing the key 'id'");
    });

    test('should report duplicate keyName values in first array', () => {
      const obj1 = { items: [{ id: 1, val: 10 }, { id: 1, val: 30 }] }; // duplicate id: 1
      const obj2 = { items: [{ id: 1, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      const duplicateReport = result.unmatched.values.find(v => v.message.includes("Duplicate key '1' found in first array"));
      expect(duplicateReport).toBeDefined();
      expect(duplicateReport.path).toBe('items');
    });
    
    test('should report duplicate keyName values in second array', () => {
      const obj1 = { items: [{ id: 1, val: 10 }] };
      const obj2 = { items: [{ id: 1, val: 10 }, { id: 1, val: 30 }] }; // duplicate id: 1
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      const duplicateReport = result.unmatched.values.find(v => v.message.includes("Duplicate key '1' found in second array"));
      expect(duplicateReport).toBeDefined();
      expect(duplicateReport.path).toBe('items');
    });

    test('keyName points to a non-primitive value (object)', () => {
      const obj1 = { items: [{ id: { complex: 1 }, val: 10 }] };
      const obj2 = { items: [{ id: { complex: 1 }, val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // Current implementation stringifies object keys. So {complex:1} becomes "[object Object]" or similar.
      // This might lead to unexpected behavior if not all objects stringify uniquely.
      // However, if they stringify to the same key value, it should "work".
      // For this specific case, they are identical, so it should match.
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('keyName points to a non-primitive value (array) - potentially problematic', () => {
      const obj1 = { items: [{ id: [1,2], val: 10 }] };
      const obj2 = { items: [{ id: [1,2], val: 10 }] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // Arrays as keys are also stringified e.g. "1,2"
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });
    
    test('keyName points to different non-primitive values that stringify differently', () => {
      const obj1 = { items: [{ id: { complex: 1 }, val: 10 }] };
      const obj2 = { items: [{ id: { complex: 2 }, val: 10 }] }; // Different complex ID
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // Stringified keys will be different.
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2); // One missing from obj1's perspective, one from obj2's
      const key1 = JSON.stringify({complex:1}); // Actual key in map is object itself, but path uses stringified
      const key2 = JSON.stringify({complex:2});
      // The path in the report is `items[id=[object Object]]` because JS by default stringifies objects that way for property accessors.
      // The internal map uses the object itself as key, so this is tricky.
      // The actual path reported is items[id={"complex":1}] (or similar based on PathUtils)
      const path1 = `items[id=${key1}]`; 
      const path2 = `items[id=${key2}]`;

      const missingReport = result.unmatched.values.find(v => v.path === path1 && v.actual === undefined);
      const extraReport = result.unmatched.values.find(v => v.path === path2 && v.expected === undefined);
      expect(missingReport).toBeDefined();
      expect(extraReport).toBeDefined();
    });


    test('should match empty arrays with key strategy', () => {
      const obj1 = { items: [] };
      const obj2 = { items: [] };
      const options = { arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } } };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('key strategy with globally ignoredKeys in keyed objects', () => {
      const obj1 = { items: [{ id: 1, val: 10, ignored: 'v1' }] };
      const obj2 = { items: [{ id: 1, val: 10, ignored: 'v2' }] };
      const options = {
        ignoredKeys: ['ignored'],
        arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } }
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0); // 'ignored' difference should be skipped
    });

    test('key strategy where keyName itself is in ignoredKeys (problematic)', () => {
      const obj1 = { items: [{ id: 1, val: 10 }] };
      const obj2 = { items: [{ id: 1, val: 10 }] };
      const options = {
        ignoredKeys: ['id'], // Ignoring the keyName!
        arrayComparisonStrategies: { 'items': { type: 'key', keyName: 'id' } }
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      // If 'id' is ignored, it cannot be used for keying.
      // The current Comparator.js doesn't explicitly prevent this.
      // It will likely try to key on `undefined` for all elements if `id` is stripped before keying,
      // or key normally if `ignoredKeys` is applied only during sub-object comparison.
      // Based on current `Comparator.js`, `ignoredKeys` is applied during key extraction in `compareObjects`
      // but not directly during the keying map creation in `_compareArraysByKey`.
      // The `el[keyName]` access happens on the original object.
      // Then, when `compareObjects` is called for `el1` and `el2`, `ignoredKeys` will take effect.
      // So, keying should work, and then `id` field comparison will be skipped.
      expect(result.summary.matchPercentage).toBe(100); 
      // However, if `id` was the *only* differing field, it would still match. Let's add another field.
       const obj3 = { items: [{ id: 1, val: 10, data: 'A' }] };
       const obj4 = { items: [{ id: 1, val: 10, data: 'A' }] };
       const comparer2 = new JSONCompare(options);
       const result2 = comparer2.compare(obj3, obj4);
       expect(result2.summary.matchPercentage).toBe(100);

       const obj5 = { items: [{ id: 1, val: 10, data: 'A' }] };
       const obj6 = { items: [{ id: 1, val: 10, data: 'B' }] }; // data differs
       const comparer3 = new JSONCompare(options);
       const result3 = comparer3.compare(obj5, obj6);
       expect(result3.summary.matchPercentage).not.toBe(100);
       expect(result3.unmatched.values[0].path).toBe('items[id=1].data'); // id was used for keying, then ignored in comparison
    });
    
    test('Nested scenario: parent array by key, child array as set', () => {
      const obj1 = { 
        items: [ 
          { id: 1, name: 'Item 1', tags: ['a', 'b', 'c'] },
          { id: 2, name: 'Item 2', tags: ['x', 'y'] }
        ] 
      };
      const obj2 = { 
        items: [ 
          { id: 2, name: 'Item 2', tags: ['y', 'x'] }, // Order changed for item 2, tags order changed
          { id: 1, name: 'Item 1', tags: ['c', 'b', 'a'] }  // Order changed for item 1, tags order changed
        ] 
      };
      const options = {
        arrayComparisonStrategies: {
          'items': { type: 'key', keyName: 'id' },
          'items[id=1].tags': { type: 'set' },
          'items[id=2].tags': { type: 'set' }
        }
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).toBe(100);
      expect(result.unmatched.values.length).toBe(0);
    });

    test('Nested scenario with differences in child set', () => {
      const obj1 = { 
        items: [ 
          { id: 1, name: 'Item 1', tags: ['a', 'b', 'c'] }
        ] 
      };
      const obj2 = { 
        items: [ 
          { id: 1, name: 'Item 1', tags: ['c', 'b', 'd'] } // 'a' replaced by 'd'
        ] 
      };
      const options = {
        arrayComparisonStrategies: {
          'items': { type: 'key', keyName: 'id' },
          'items[id=1].tags': { type: 'set' }
        }
      };
      const comparer = new JSONCompare(options);
      const result = comparer.compare(obj1, obj2);
      expect(result.summary.matchPercentage).not.toBe(100);
      expect(result.unmatched.values.length).toBe(2); // For 'a' and 'd' in tags array
      
      const mismatchA = result.unmatched.values.find(v => v.path === 'items[id=1].tags' && v.expected.includes("Element 'a' count: 1"));
      const mismatchD = result.unmatched.values.find(v => v.path === 'items[id=1].tags' && v.actual.includes("Element 'd' count: 1"));
      expect(mismatchA).toBeDefined();
      expect(mismatchD).toBeDefined();
    });
  });
});
