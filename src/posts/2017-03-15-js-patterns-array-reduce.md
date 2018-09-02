# JavaScript Patterns — Wrangling arrays like a boss, with Array#reduce 👊

## What? 🤔

At Hashnode, whenever we push our code upstream, we invite the rest of us, for a review of the same. These code review sessions, are uber awesome; primarily because we all get a chance of learning something unique.

Whenever a reviewer comes across a part of the code that could be optimised / refactored / rewritten in a better way, he makes a note of it, and passes it along to everyone, for future reference.

This story is a result of one of the notes I made, and the thought of turning it into a full-blown story.

Hopefully towards the end of it, some of you’ll appreciate the elegance of `Array#reduce`, and how you could use it to write efficient code when working with arrays in JavaScript.

Let's get started! 🙌🏼

## The Basics 👩‍🏫

As a programmer, it is pretty common to come across scenarios where you have to work with arrays of data, and to transform the said data into a desired format.

JavaScript has a `reduce` function available on array objects, which aids us in doing exactly that — transform the array data into a desired format. `reduce` takes two arguments:

- a `reducer` function, which is applied against an `accumulator`, and each `item` in the array (from left to right), to reduce it into to a single value
- an `initialValue` for the accumulator

What a mouthful! Let’s look at some code.

The below example, summing an array of numbers, is a quintessential one, which is given whenever `Array#reduce` is introduced.

```
const numbers = [10, 20, 30];
const reducer = (accumulator, item) => {
    return accumulator + item;
};

const initialValue = 0;
const total = numbers.reduce(reducer, initialValue);

// The following outputs: "The sum is: 60"
console.log("The sum is: ", total);
```

### **Important "Pitfall" Note 👇**

> **Always remember to **`return` **in a **`reducer` **function.** Whatever you return becomes the `accumulator` value, for the next `item` in the array.

It might seem trivial in a simple reducer function like above, but more often than not, in complex reducer functions, forgetting to `return` is one of the main causes of `Array#reduce` "bugs".

---

Before we discuss on how _**we**_ made use of `Array#reduce` to rewrite a tiny part of our codebase; let me run you through a couple of pointers, that I've found to be not-so-intuitive for those who are unacquainted with them.

### #1: `reduce` operation can be used on an array to reduce it, not necessarily to a primitive value, but also to an object (including an array)

Let's write a program to find out the total number of multiples of 6 in an array, and output an object — like this: `{ totalMultiplesOfSix: 1, totalNonMultiplesOfSix: 1 }`, say for an input of: `[6, 7]`.

```
const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const multiplesOfSixInfo = numArray => numArray.reduce(
    (acc, item) => {
        (item % 6 === 0)
            ? acc.totalMultiplesOfSix += 1
            : acc.totalNonMultiplesOfSix += 1;

        // Don't forget to return the accumulator, and make it available ...
        // ...to the next item in numArray
        return acc;
    },
    { totalMultiplesOfSix: 0, totalNonMultiplesOfSix: 0 }
);

// The following outputs "{totalMultiplesOfSix: 3, totalNonMultiplesOfSix: 7}"
console.log(multiplesOfSixInfo(numbers));
```

Notice that the initial value passed in `numArray#reduce` is the object `{ totalMultiplesOfSix: 0, totalNonMultiplesOfSix: 0 }`.

### #2: `map` and `filter` operations, can be thought of as `reduce` operations

Let's get straight down to some code to understand what the above pointer means. Here's some code with a `map` operation:

```
const numbers = [10, 20, 30];
const squaresOfNumbers = numArray => numbers.map(item => item * item;);

// The following outputs: "[100, 400, 900]"
console.log(squaresOfNumbers(numbers));
```

The above code can be re-written using `Array#reduce` as:

```
const numbers = [10, 20, 30];
const squaresOfNumbers = numArray => numbers.reduce(
    (acc, item) => {
        acc.push(item * item);
        return acc;
    },
    []
);

// The following outputs: "[100, 400, 900]"
console.log(squaresOfNumbers(numbers));
```

Let's look at a `filter` operation, now:

```
const numbers = [10, 20, 30];
const multiplesOfSix = numArray => numArray.filter(item => item % 6 === 0);

// The following outputs: "[30]"
console.log(multiplesOfSix(numbers));
```

The above code can be re-written using `Array#reduce` as:

```
const numbers = [10, 20, 30];
const multiplesOfSix = numArray => numArray.reduce(
    (acc, item) => {
        if (item % 6 === 0) acc.push(item);
        return acc;
    },
    []
);

// The following outputs: "[30]"
console.log(multiplesOfSix(numbers));
```

Now that we have discussed #2 — understanding which, is a pre-cursor to understanding the next point — let's jump to #3.

### #3: you can use `reduce` to rewrite multiple operations on an array into a single op.

After a first glance at code under #2, you might have thought the code with `map` and `filter` is much more concise, and readable, than its counterpart `reduce` code; and you are right in thinking so.

But when you have an array with a lot of values, doing multiple operations on it — for instance, a `map`, followed by a `map`, followed by a `filter` — can get **resource intensive**.

It is at places like the above, where a single `reduce` operation, is a far more **beneficial pattern**, instead of multiple operations on the array; even when the latter leads to concise code.

## One `reduce` to rule them all ✨

**a.k.a. #3 — you can use **`reduce` **to rewrite multiple operations on an array into a single op.; a beneficial pattern, especially when dealing with large arrays**

Let's look at some code, to know more about this pattern; and what exactly the words, '**beneficial pattern**', and '**resource intensive**' entail here.

The problem _**we**_ had at hand, was to get an array of (unique) emails, of all followers, for a given set of nodes. So for an example, dummy `nodes` dataset like the following:

```
var nodes = [
    { 
        name: 'java',
        followers: [
            { name: 'ABC', email: 'abc@abc.com' },
            { name: 'IJK', email: 'ijk@ijk.com' },
            { name: 'LMN', email: 'lmn@lmn.com' }
        ]
    },
    { 
        name: 'javascript',
        followers: [
            { name: 'ABC', email: 'abc@abc.com' },
            { name: 'IJK', email: 'ijk@ijk.com' },
            { name: 'XYZ', email: 'xyz@xyz.com' }
        ]
    },
    { 
        name: 'programming',
        followers: [
            { name: 'XYZ', email: 'abc@abc.com' },
            { name: 'IJK', email: 'ijk@ijk.com' },
            { name: 'PQR' }
        ]
    }
]
```

...the output of the function `getSetOfFollowerEmails(nodes)` is expected to be:

```
[
    'abc@abc.com',
    'ijk@ijk.com',
    'lmn@lmn.com',
    'xyz@xyz.com'
]
```

### Old code 👵

This was the code which I came across in my review. The following code is so concise, that even my grand-mom would get it after a single go! :D

```
import _ from 'lodash';

const getSetOfFollowerEmails = (nodes) => {    
    let followers = _.flatten(nodes.map(node => node.followers));
    followers = followers.filter(follower => follower.email ? true : false);
    followers = _.uniqBy(followers, 'email');

    const followerEmails = followers.map(follower => follower.email);
    return followerEmails;
}
```

### Improved code 👩

But ... we changed its implementation. While the following code isn't as concise, or as readable, as the above code; it has its + points. Read the code, and we'll see why!

```
const getSetOfFollowerEmails = (nodes) => {
    return _.uniq(nodes.reduce(
        (followerEmails, node) => {
            node.followers.forEach(
                follower => {
                    if (follower.email) {
                        followerEmails.push(follower.email);
                    }
                }
            );

            // Don't forget to return the accumulator;
            return followerEmails;
        },
        // Initial accumulator here, is an empty array
        []
    ));
}
```

**Update:** [Robert Stires](https://hashnode.com/@rjstires "Robert Stires's Profile - Hashnode") optimised the above piece of code, even more by replacing the `forEach` operation, with a `reduce` operation. Take a look, [here](https://jsperf.com/multi-reducer-comparison). Nicely done, Robert! 👏

### Rationale 🤓

The most obvious observation would be — as the number of `followers` grow, so does the inefficiency of the old code 👵, because, if you obverse, we're iterating through the `followers` array multiple times; but where as in the improved code, we're only doing it twice.

But let's verify the above observation with numbers. Let's create a dummy, large `nodes` dataset and let's use both of the implementations, on `nodes`, to find out which one's better.

The requisite code for doing so, can be framed as follows:

```
const getEmailsUsingSingleReduceOp = (nodes) => { ...
const getEmailsUsingMultipleArrayOps = (nodes) => { ...

const nodes = [];
for (let i = 0; i < 50; i++) {
    const followers = [];
    for (let j = 0; j < 5000; j++) {
        followers.push({ name: `ABC${i}${j}`, email: `abc${i}${j}@abc.com` });
    }
    nodes.push({
        name: `node${i}`,
        followers: followers
    });
}

console.time('Multiple Array Ops.');
getEmailsUsingMultipleArrayOps(nodes);
console.timeEnd('Multiple Array Ops.');

console.time('Single Reduce Op.');
getEmailsUsingSingleReduceOp(nodes);
console.timeEnd('Single Reduce Op.');
```

The above code outputs (approx. values):

```
Multiple Array Ops.: 535.941ms
Single Reduce Op.: 149.408ms
```

As you can see, `getEmailsUsingSingleReduceOp` outperforms `getEmailsUsingMultipleArrayOps` by ~3.6 times.

## Conclusion 👋

We've seen the basics of `Array#reduce` and how to make use of it to improve code with multiple operations on an array; resulting in better performant code.

There are other cool patterns that you can achieve by using `Array#reduce`. For instance, you can create function pipelines (you can also create function pipelines that you can break out of, mid-way, using `Array#some`). I look forward to covering these in a different story.

Until then, 🙂👋!
