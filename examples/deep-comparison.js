/**
 * @fileoverview Example demonstrating deep nested structure comparison with JSONCompare
 * @author AshmeetSehgal.com
 * Try this example online in the interactive playground:
 * https://ashmeetsehgal.com/tools/json-compare
 */

const JSONCompare = require('../index');

// Complex nested structure with arrays, objects, and various data types
const nestedObj1 = {
  company: {
    name: "Innovatech Solutions",
    founded: new Date("2020-05-12"),
    departments: [
      {
        id: "eng",
        name: "Engineering",
        employees: [
          { 
            id: 101,
            name: "Alice Chen",
            skills: ["JavaScript", "React", "Node.js"],
            details: {
              yearsOfExperience: 5,
              education: {
                degree: "Computer Science",
                university: "Stanford"
              },
              projects: [
                { id: "p1", name: "API Gateway", completed: true },
                { id: "p2", name: "Dashboard", completed: false }
              ]
            }
          },
          { 
            id: 102,
            name: "Bob Smith",
            skills: ["Python", "Django", "AWS"],
            details: {
              yearsOfExperience: 3,
              education: {
                degree: "Information Systems",
                university: "MIT"
              },
              projects: [
                { id: "p3", name: "Machine Learning Service", completed: true }
              ]
            }
          }
        ]
      },
      {
        id: "mkt",
        name: "Marketing",
        employees: [
          { 
            id: 201,
            name: "Carol Davis",
            skills: ["Content Strategy", "SEO", "Analytics"],
            details: {
              yearsOfExperience: 7,
              education: {
                degree: "Marketing",
                university: "UCLA"
              },
              projects: []
            }
          }
        ]
      }
    ],
    metrics: {
      revenue: 2500000,
      employees: 55,
      satisfaction: 4.8,
      growth: {
        q1: 0.12,
        q2: 0.08,
        q3: 0.15,
        q4: 0.10
      }
    }
  }
};

// Modified version with changes at various nesting levels
const nestedObj2 = {
  company: {
    name: "Innovatech Solutions",
    founded: new Date("2020-05-12"),
    departments: [
      {
        id: "eng",
        name: "Engineering Department", // Name changed
        employees: [
          { 
            id: 101,
            name: "Alice Chen",
            skills: ["JavaScript", "React", "TypeScript"], // Changed skill
            details: {
              yearsOfExperience: "5", // Changed to string
              education: {
                degree: "Computer Science",
                university: "Stanford"
              },
              projects: [
                { id: "p1", name: "API Gateway", completed: true },
                { id: "p2", name: "Dashboard UI", completed: false } // Name changed
              ]
            }
          },
          { 
            id: 102,
            name: "Bob Smith",
            skills: ["Python", "Django", "AWS"],
            details: {
              yearsOfExperience: 3,
              education: {
                degree: "Information Systems",
                university: "MIT"
              },
              // Missing projects array
            }
          }
        ]
      },
      {
        id: "mkt",
        name: "Marketing",
        employees: [
          { 
            id: 201,
            name: "Carol Davis",
            skills: ["Content Strategy", "SEO", "Analytics", "Social Media"], // Added skill
            details: {
              yearsOfExperience: 7,
              education: {
                degree: "Marketing",
                university: "UCLA"
              },
              projects: [] // Same empty array
            }
          }
        ]
      },
      {
        id: "sales", // Extra department
        name: "Sales",
        employees: []
      }
    ],
    metrics: {
      revenue: "2.5M", // Changed format
      employees: 60,   // Changed value
      satisfaction: 4.8,
      growth: {
        q1: 0.12,
        q2: 0.08,
        q3: 0.15,
        // Missing q4
      }
    }
  }
};

// Create a comparator for deep structure comparison
const deepCompare = new JSONCompare({
  // Allow comparison between numbers and their string representation
  equivalentValues: {
    'yearsOfExp': [5, '5'],
    'revenue': [2500000, '2.5M', '2500000']
  },
  strictTypes: false,
  ignoreExtraKeys: false
});

// Perform the comparison
const result = deepCompare.compare(nestedObj1, nestedObj2);

// Function to print path differences nicely
function printPathDifferences(result) {
  const differences = {};
  
  // Group unmatched values by parent path
  result.unmatched.values.forEach(unmatch => {
    const pathParts = unmatch.path.split('.');
    
    // Skip last segment to group by parent
    const parentPath = pathParts.slice(0, -1).join('.');
    const field = pathParts[pathParts.length - 1];
    
    if (!differences[parentPath]) {
      differences[parentPath] = [];
    }
    
    differences[parentPath].push({
      field,
      expected: unmatch.expected,
      actual: unmatch.actual,
      path: unmatch.path
    });
  });

  // Group unmatched keys by parent path
  result.unmatched.keys.forEach(unmatch => {
    const pathParts = unmatch.path.split('.');
    
    // Skip last segment to group by parent
    const parentPath = pathParts.slice(0, -1).join('.');
    const field = pathParts[pathParts.length - 1];
    
    if (!differences[parentPath]) {
      differences[parentPath] = [];
    }
    
    differences[parentPath].push({
      field,
      expected: "key present",
      actual: "key missing or extra",
      path: unmatch.path,
      message: unmatch.message
    });
  });

  // Print grouped differences
  console.log("\n=== DIFFERENCES BY SECTION ===");
  for (const [path, diffs] of Object.entries(differences)) {
    console.log(`\nPath: ${path || 'root'}`);
    diffs.forEach(diff => {
      console.log(`  - ${diff.field}: ${JSON.stringify(diff.expected)} vs ${JSON.stringify(diff.actual)}`);
    });
  }
}

console.log("\n=== DEEP COMPARISON SUMMARY ===");
console.log(`Match percentage: ${result.summary.matchPercentage.toFixed(2)}%`);
console.log(`Total keys compared: ${result.summary.totalKeysCompared}`);
console.log(`Total matched: ${result.summary.totalMatched}`);
console.log(`Total unmatched: ${result.summary.totalUnmatched}`);

// Print differences grouped by section
printPathDifferences(result);

// Show array-specific differences
console.log("\n=== ARRAY DIFFERENCES ===");
result.unmatched.values
  .filter(diff => diff.path.includes('['))
  .forEach(diff => {
    console.log(`Array path: ${diff.path}`);
    console.log(`Expected: ${JSON.stringify(diff.expected)}`);
    console.log(`Actual: ${JSON.stringify(diff.actual)}`);
    console.log('---');
  });

// Show missing or extra objects in the hierarchy
console.log("\n=== STRUCTURAL DIFFERENCES ===");
result.unmatched.keys
  .filter(diff => diff.message.includes('exists in object'))
  .forEach(diff => {
    console.log(`Path: ${diff.path}`);
    console.log(`Note: ${diff.message}`);
    if (diff.value !== undefined) {
      console.log(`Value: ${typeof diff.value === 'object' ? JSON.stringify(diff.value) : diff.value}`);
    }
    console.log('---');
  });