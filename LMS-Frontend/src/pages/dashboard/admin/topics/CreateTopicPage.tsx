import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { topicApi } from "../../../../services/topicApi";

const DUMMY_TOPICS = [
  {
    title: "Python Programming",
    description:
      "A comprehensive introduction to Python programming language covering fundamentals to advanced concepts.",
    chapters: [
      {
        title: "Introduction to Python",
        content:
          "<h3>What is Python?</h3><p>Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum and first released in 1991, Python has become one of the most popular programming languages in the world.</p><h3>Why Learn Python?</h3><ul><li><strong>Easy to learn</strong> — Python has a clean, readable syntax that makes it beginner-friendly.</li><li><strong>Versatile</strong> — Used in web development, data science, AI/ML, automation, and more.</li><li><strong>Large community</strong> — Extensive libraries and active community support.</li></ul><h3>Setting Up Python</h3><p>Download Python from <strong>python.org</strong> and install it on your machine. Verify the installation by running:</p><pre><code>python --version</code></pre><p>You can write Python code in any text editor or use an IDE like VS Code, PyCharm, or Jupyter Notebook.</p>",
      },
      {
        title: "Variables & Data Types",
        content:
          '<h3>Variables in Python</h3><p>Variables are containers for storing data values. Python has no command for declaring a variable — a variable is created the moment you assign a value to it.</p><pre><code>name = "Alice"\nage = 25\nheight = 5.6\nis_student = True</code></pre><h3>Data Types</h3><ul><li><strong>str</strong> — Text: <code>"Hello"</code></li><li><strong>int</strong> — Integer numbers: <code>42</code></li><li><strong>float</strong> — Decimal numbers: <code>3.14</code></li><li><strong>bool</strong> — Boolean: <code>True</code> or <code>False</code></li><li><strong>list</strong> — Ordered collection: <code>[1, 2, 3]</code></li><li><strong>dict</strong> — Key-value pairs: <code>{"key": "value"}</code></li></ul><h3>Type Checking</h3><pre><code>x = 10\nprint(type(x))  # &lt;class \'int\'&gt;</code></pre>',
      },
      {
        title: "Control Flow",
        content:
          '<h3>Conditional Statements</h3><p>Python uses <code>if</code>, <code>elif</code>, and <code>else</code> for decision making:</p><pre><code>age = 18\nif age >= 18:\n    print("You are an adult")\nelif age >= 13:\n    print("You are a teenager")\nelse:\n    print("You are a child")</code></pre><h3>Loops</h3><h4>For Loop</h4><pre><code>fruits = ["apple", "banana", "cherry"]\nfor fruit in fruits:\n    print(fruit)</code></pre><h4>While Loop</h4><pre><code>count = 0\nwhile count < 5:\n    print(count)\n    count += 1</code></pre><h3>Loop Control</h3><ul><li><code>break</code> — Exit the loop</li><li><code>continue</code> — Skip to the next iteration</li><li><code>pass</code> — Do nothing (placeholder)</li></ul>',
      },
      {
        title: "Functions",
        content:
          '<h3>Defining Functions</h3><p>Functions are reusable blocks of code defined with the <code>def</code> keyword:</p><pre><code>def greet(name):\n    return f"Hello, {name}!"\n\nresult = greet("Alice")\nprint(result)  # Hello, Alice!</code></pre><h3>Default Parameters</h3><pre><code>def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(3))     # 9\nprint(power(3, 3))  # 27</code></pre><h3>Lambda Functions</h3><p>Small anonymous functions defined with <code>lambda</code>:</p><pre><code>square = lambda x: x ** 2\nprint(square(5))  # 25</code></pre><h3>*args and **kwargs</h3><pre><code>def flexible(*args, **kwargs):\n    print(args)    # Tuple of positional args\n    print(kwargs)  # Dict of keyword args\n\nflexible(1, 2, name="Alice")</code></pre>',
      },
      {
        title: "Lists & Dictionaries",
        content:
          '<h3>Lists</h3><p>Lists are ordered, mutable collections:</p><pre><code>colors = ["red", "green", "blue"]\ncolors.append("yellow")\ncolors.remove("green")\nprint(colors[0])   # red\nprint(len(colors)) # 3</code></pre><h3>List Comprehension</h3><pre><code>squares = [x**2 for x in range(10)]\nevens = [x for x in range(20) if x % 2 == 0]</code></pre><h3>Dictionaries</h3><p>Dictionaries store key-value pairs:</p><pre><code>student = {\n    "name": "Alice",\n    "age": 20,\n    "grades": [90, 85, 92]\n}\n\nprint(student["name"])  # Alice\nstudent["email"] = "alice@example.com"</code></pre><h3>Dictionary Methods</h3><ul><li><code>.keys()</code> — All keys</li><li><code>.values()</code> — All values</li><li><code>.items()</code> — Key-value pairs</li><li><code>.get(key, default)</code> — Safe access</li></ul>',
      },
    ],
  },
  {
    title: "Web Development Basics",
    description:
      "Learn the foundations of web development including HTML, CSS, and JavaScript.",
    chapters: [
      {
        title: "Introduction to HTML",
        content:
          "<h3>What is HTML?</h3><p>HTML (HyperText Markup Language) is the standard language for creating web pages. It describes the structure of a web page using markup.</p><h3>Basic Structure</h3><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n&lt;head&gt;\n    &lt;title&gt;My Page&lt;/title&gt;\n&lt;/head&gt;\n&lt;body&gt;\n    &lt;h1&gt;Hello World&lt;/h1&gt;\n    &lt;p&gt;This is my first web page.&lt;/p&gt;\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><h3>Common Tags</h3><ul><li><code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> — Headings</li><li><code>&lt;p&gt;</code> — Paragraphs</li><li><code>&lt;a&gt;</code> — Links</li><li><code>&lt;img&gt;</code> — Images</li><li><code>&lt;ul&gt;</code>, <code>&lt;ol&gt;</code>, <code>&lt;li&gt;</code> — Lists</li><li><code>&lt;div&gt;</code>, <code>&lt;span&gt;</code> — Containers</li></ul>",
      },
      {
        title: "CSS Fundamentals",
        content:
          "<h3>What is CSS?</h3><p>CSS (Cascading Style Sheets) controls the visual presentation of HTML elements — colors, layouts, fonts, spacing, and more.</p><h3>Adding CSS</h3><pre><code>&lt;style&gt;\n  h1 {\n    color: blue;\n    font-size: 24px;\n  }\n  .highlight {\n    background-color: yellow;\n    padding: 10px;\n  }\n&lt;/style&gt;</code></pre><h3>Key Properties</h3><ul><li><code>color</code> — Text color</li><li><code>background-color</code> — Background</li><li><code>font-size</code> — Text size</li><li><code>margin</code> / <code>padding</code> — Spacing</li><li><code>display</code> — Layout behavior (block, flex, grid)</li></ul><h3>Flexbox</h3><pre><code>.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}</code></pre>",
      },
      {
        title: "JavaScript Basics",
        content:
          '<h3>What is JavaScript?</h3><p>JavaScript is the programming language of the web. It makes web pages interactive and dynamic.</p><h3>Variables</h3><pre><code>let name = "Alice";\nconst age = 25;\nvar legacy = "avoid using var";</code></pre><h3>Functions</h3><pre><code>function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconst greetArrow = (name) =&gt; `Hello, ${name}!`;</code></pre><h3>DOM Manipulation</h3><pre><code>const heading = document.querySelector("h1");\nheading.textContent = "Updated!";\nheading.style.color = "red";\n\ndocument.getElementById("btn")\n  .addEventListener("click", () =&gt; {\n    alert("Button clicked!");\n  });</code></pre>',
      },
    ],
  },
  {
    title: "Data Structures & Algorithms",
    description:
      "Core computer science concepts covering essential data structures and algorithms.",
    chapters: [
      {
        title: "Arrays & Strings",
        content:
          "<h3>Arrays</h3><p>An array is a collection of elements stored at contiguous memory locations. It is the most fundamental data structure.</p><h3>Operations & Complexity</h3><ul><li><strong>Access by index</strong> — O(1)</li><li><strong>Search</strong> — O(n)</li><li><strong>Insertion at end</strong> — O(1) amortized</li><li><strong>Insertion at beginning</strong> — O(n)</li><li><strong>Deletion</strong> — O(n)</li></ul><h3>Common Patterns</h3><ul><li><strong>Two Pointers</strong> — Use two indices moving towards each other</li><li><strong>Sliding Window</strong> — Maintain a window over the array</li><li><strong>Prefix Sum</strong> — Precompute cumulative sums for range queries</li></ul><h3>Strings</h3><p>Strings are essentially arrays of characters. Key operations include reversal, substring search, and pattern matching.</p>",
      },
      {
        title: "Linked Lists",
        content:
          "<h3>What is a Linked List?</h3><p>A linked list is a linear data structure where each element (node) contains data and a reference to the next node.</p><h3>Types</h3><ul><li><strong>Singly Linked List</strong> — Each node points to the next</li><li><strong>Doubly Linked List</strong> — Nodes point to both next and previous</li><li><strong>Circular Linked List</strong> — Last node points back to the first</li></ul><h3>Operations</h3><pre><code>class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def append(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        current = self.head\n        while current.next:\n            current = current.next\n        current.next = new_node</code></pre>",
      },
      {
        title: "Sorting Algorithms",
        content:
          "<h3>Why Sorting Matters</h3><p>Sorting is a fundamental operation that many other algorithms depend on. Understanding different sorting algorithms helps in choosing the right one for your use case.</p><h3>Common Algorithms</h3><table><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th></tr><tr><td>Bubble Sort</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td></tr><tr><td>Merge Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td></tr><tr><td>Quick Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td></tr></table><h3>Quick Sort Example</h3><pre><code>def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)</code></pre>",
      },
      {
        title: "Trees & Graphs",
        content:
          "<h3>Binary Trees</h3><p>A tree where each node has at most two children — left and right.</p><h3>Tree Traversals</h3><ul><li><strong>Inorder</strong> (Left, Root, Right) — Gives sorted order for BST</li><li><strong>Preorder</strong> (Root, Left, Right) — Used for copying trees</li><li><strong>Postorder</strong> (Left, Right, Root) — Used for deleting trees</li><li><strong>Level Order</strong> — BFS using a queue</li></ul><h3>Binary Search Tree</h3><pre><code>class TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None\n\ndef insert(root, val):\n    if not root:\n        return TreeNode(val)\n    if val < root.val:\n        root.left = insert(root.left, val)\n    else:\n        root.right = insert(root.right, val)\n    return root</code></pre><h3>Graphs</h3><p>Graphs consist of vertices (nodes) and edges (connections). They can be directed or undirected, weighted or unweighted.</p>",
      },
    ],
  },
];

const CreateTopicPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dummyLoading, setDummyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await topicApi.createTopic({
        title: title.trim(),
        description: description.trim() || undefined,
        published,
      });
      if (response.success) {
        navigate("/dashboard/topics");
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create topic");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDummy = async () => {
    try {
      setDummyLoading(true);
      setError(null);
      setSuccessMsg(null);

      let createdCount = 0;
      for (const dummy of DUMMY_TOPICS) {
        // Create the topic (published)
        const topicRes = await topicApi.createTopic({
          title: dummy.title,
          description: dummy.description,
          published: true,
        });

        if (topicRes.success && topicRes.data) {
          const topicId = topicRes.data.id;

          // Create chapters sequentially
          for (let i = 0; i < dummy.chapters.length; i++) {
            const ch = dummy.chapters[i];
            await topicApi.createChapter(topicId, {
              title: ch.title,
              content: ch.content,
              displayOrder: i + 1,
            });
          }

          // Publish the topic
          await topicApi.publishTopic(topicId);
          createdCount++;
        }
      }

      setSuccessMsg(
        `Successfully created ${createdCount} topics with chapters! Redirecting...`,
      );
      setTimeout(() => navigate("/dashboard/topics"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create dummy topics");
    } finally {
      setDummyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/topics")}
            className="text-primary hover:text-secondary text-sm font-medium"
          >
            ← Back to Topics
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h1 className="text-2xl font-bold text-text mb-6">Create Topic</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {successMsg}
            </div>
          )}

          {/* Quick Dummy Creation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-800 mb-1">
                  Quick Start — Create Sample Topics
                </h3>
                <p className="text-xs text-blue-600 mb-3">
                  Instantly create 3 published topics (Python, Web Dev, DSA)
                  with fully written chapters so you can see how everything
                  works.
                </p>
                <button
                  type="button"
                  onClick={handleCreateDummy}
                  disabled={dummyLoading || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {dummyLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Creating topics & chapters...
                    </>
                  ) : (
                    "Create 3 Sample Topics with Chapters"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-text-secondary">
                or create your own
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Python Programming"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="A brief description of this topic..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-text"
              >
                Publish immediately (visible to students)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Topic"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard/topics")}
                className="px-6 py-2 border border-border text-text rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTopicPage;
