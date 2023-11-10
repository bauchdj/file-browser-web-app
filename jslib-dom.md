# JSLib-DOM

## ChatGPT insights:

```js
jsl.dom.add(parentNode, {
	tag: "div", // HTML tag to be created
	id: "uniqueID", // ID of the new element
	className: "myClass", // Class name for the element
	  style: { // Inline styles for the element
		    color: "red",
		    fontSize: "14px"
		    // ... other styles
	  },
	text: "Hello, World!", // Text content for the element
	children: [ // Nested children elements
	{
		tag: "span",
		text: "Child element"
		// ... other properties
	}
	// ... more children
	]
	// ... other properties
});

```

This jsl.dom.add method is quite versatile because it allows for nested elements and complex DOM structures to be built with a single call. It abstracts away the repetitive tasks of element creation, attribute setting, and event binding.

To use this function, you'd provide an object describing the entire element you wish to create, including any child elements. The jsl.dom.add function would then interpret this object, create the DOM elements accordingly, and insert them into the page.

If you have a specific structure you'd like to create using this library, you can describe it, and I can help you craft the appropriate object to pass to jsl.dom.add.

From the snippet of code you've provided, the jsl object appears to offer a robust set of features for interacting with and manipulating the DOM, as well as some utilities for debugging and string manipulation. Here’s a deeper look at some of the additional features and capabilities:

### Event Handling:

Custom event handling seems to be integrated, allowing for actions to be attached to DOM elements. For example, there's handling for double-click events and possibly other events as well.

### DOM Element Extension:

The jsl.dom.add function is designed to not only create and append elements but also to potentially extend them with additional properties or methods. This can be seen where the code checks for an el property and attaches various properties and functions to it.

### Conditional Execution:

The library includes condition checks, such as verifying if a property is a function before attempting to execute it, which suggests that it's designed to handle dynamic content where element properties can be functions that need to be evaluated at runtime.

### Unique ID Generation:

There's functionality to generate unique IDs for elements (jsl.dom.uniqueId), which is useful for ensuring that elements have unique identifiers in the DOM, a common requirement for dynamic JavaScript applications.

### Highlighting and Visualization:

Functions like jsl.dom.highlight suggest that the library may be used for debugging or interactive development, where elements can be visually highlighted on the page.

### Stack Trace Utility:

The jsl.util.dumpStackTrace method indicates that the library provides a way to log stack traces, which can be quite helpful for debugging complex applications.

### Internationalization:

The jsl.terms and jsl.cw suggest there's a rudimentary internationalization system in place to handle translations and language changes on the fly.

### Style and Positioning:

The library seems to handle the application of styles and the calculation of element positions, which is an essential part of creating a responsive and interactive user interface.

### Error Handling:

The presence of try-catch blocks and error handling routines suggests the library is designed to gracefully handle errors that may occur during DOM manipulation.

### Canvas Drawing:

There are hints at canvas manipulation functions, such as jsl.dom.highlightCanvas, which could be used to draw shapes or visual highlights on a canvas element, potentially for graphical annotations.

### Dynamic Content Creation:

The library appears to support dynamic content creation, including the ability to add text nodes, create various types of elements (images, links, options, etc.), and insert them into the DOM.
The jsl library encapsulates a variety of tasks that would typically require verbose and repetitive code, offering a more declarative and object-oriented approach to handling complex DOM operations and user interactions. It seems tailored for applications that require a high degree of dynamic content manipulation and could be particularly useful in single-page applications (SPAs) or situations where the DOM structure is highly variable and dependent on user interactions or other real-time data sources.


## And now for something totally different ...

After reading this document, come back and read this statement:

> If this doesn’t seem really simple to you, then you are not getting it. Perhaps, we need to add/change part of this document. If you do get it, you might wonder why this hasn’t been done before since it would have been possible pretty much since the DOM was exposed to JavaScript circa 2000. I do not know why this isn’t the standard way to create hand crafted HTML suitable for applications.

Browsers really present the DOM (Document Object Model). You can give a browser HTML to parse or you could call DOM methods to create the objects directly. Calling the DOM methods directly is fast but would require a lot of lines of code to do what a few lines of HTML could do.

That being said, the DOM method is programmatic which makes it very suitable for doing things where the DOM objects to be added (or their properties) need to be dynamically determined.

So, lets look at what HTML is ... a tag with attributes. Attributes are sort of like properties, right? So, instead of HTML we could use a JavaScript object.

```html
<div></div>
```
```js
{ tag: div }
```

But, we can put children inside of the HTML div, so we need a way to do that in JavaScript.

```html
<div><span>Hello World</span></div>
```

becomes:

```js
{
	tag: 'div', 
	children: [
		{ tag: 'span', text: "Hello World" }
	]
}
```

Of course, this can be constructed programmatically as follows:

```js
const div = { tag: 'div', children:[] }
const greeting = "Hello World";
const span = { tag: 'div', text: greeting };
div.children.push( span );
```

Ok, so that is pretty workable, but we have quite a bit of repetitive "ceremony" that can be dispensed. First, we know that "div" and "span" are common tag properties and the would not be used as a property name. Further, we know that the child node of these tags will either be text node (JavaScript typeof string) or one or more other objects.

So, we could shorten the code above to the following:

```js
const div = { div:[{ span: "Hello World" }] };
```

Hmmm, that’s pretty concise while still be something that I can differentiate programmatically.

## Attributes Supported:

See the HTML specification. Anything you add to the JS object other than the tag name is simply passed through to the browser as an attribute except for children, siblings and onrender see below. 

For example, you could do the following:

```js
{ div: "Hi There", "class": "someClass", "data role": "someRole" }
```

**Note:** class is a keyword in JavaScript so you have to quote it.

What is "data role"? I don’t know, must be some Angular thing where the Angular code looks for elements having that attribute. Regardless, it will simply get transferred from the JS object to DOM object.

## CSS or Styles

The HTML style attribute is a list of properties. So, in JS it is simply a nested object such as:

```js
{
	div: "Hi There",
	style: {
		color:'#ff0000',
		backgroundColor:'#00ff00' // could use "background-color" as the property name
	}
}
```

## Event Handlers
Ok, now for the a good part .. anonymous functions to be used as event handlers.

```js
{
	div: "Click Me!",
	onclick: function () {
		console.log( "I was clicked" );
	} 
}
```

Everything about this object in one place.

Of course, you might was to be able to call the handlers via an automated test in which case you could do something like the following:

```js
const handler = {
	btn: function () {
		console.log( “Button was clicked” );
	}
};
const btn = {
	div: "Click Me!",
	onclick: handler.btn
}
handler.btn(); // Test Code
```

**Q.** Ok, so what if I commonly use the same type of objects?
**A.** Write a function that creates such an object and returns it.

```js
const makeButton = function (text, onclick) {
	return {
		div: text, "class": "btnClass", onclick: onclick
	}
};
makeButton( "Open", handler.open );
makeButton( "Close", handler.close );
```

## Ok, so how do you put these into the page?

**parentNode:** an HTMLelement such as 
```js
document.getElementsByTagName("BODY")[0];
```

**object:** one of the JS objects we have been talking about ... including all of its children
```js
jsl.dom.add( parentNode, object );
```

Again, you can create a whole page worth of objects and pass them all into a single call to jsl.dom.add which will then reflect through the whole object.

## siblings

 Sometimes you want to layout multiple items that are at the same level in the DOM hierarchy. Just as an object can have children, the object can also have siblings such as:

```js
const div = {
	div: [
		... some child objects ],
	siblings: [
		... objects at the same level as the div
	]
};
```

## onrender

Sometimes you want to do something with the HTMLelement after it is rendered such as a jQuery thing. 

If so, you can add an onrender method to the object. The method is called and the HTMLelement is passed to it. For example:

```js
const div = { div: '',
	onrender: function (el) {
		$(el).somejQueryMagicalMethod();
	}
};
```

Again, you can **fully** declare the object in one place.

## The el property

After an item is rendered, it has a property named el. You can use this property to update the DOM object such as:

```js
const div = { div: "howdy" };
jsl.dom.add( someParentNode, div );
div.el.style.color = '#ff0000';
```

or, you could add some more stuff inside of it:

```js
jsl.dom.add( div.el, ... some object to add inside of the div .. );
```

## Test Driven Design (TDD)

There are whole books on TDD, but my opinion is simply this ... I cannot think of a bug that was still there after I tested/fixed the code that had the bug -- **key being tested**.

Bugs are born in untested code -- either the code itself was never tested or it was never tested in its current "environment".  By environment, I mean supporting code that the buggy codes relies on or injects into. 

I would say that 99% of bugs I have created were due to unintended consequences -- I changed some code to effect a new feature and as a result something I didn’t mean to change broke. 

Thus, there is a lot of benefit in just knowing that nothing changed that I did not intend to change. A unit test around the code would provide me with that benefit.

Of course, if I make the change and the test fails because all it is doing is detecting a change that is actually ok, I will have to update the test. For example, if I capture the output of a function and put it in the test, then I change the function the test is going to fail. I will have to update the test to accept the new output.

I would rather do this 100 times than have a customer report a bug (with a vague description as only a customer can create), than spend hours trying to reproduce the issue and track down the bug.

## Every Day Usage

The application layout is typically:

1) some elementary navigation elements
2) some dynamically created content elements
3) lists
4) tabs
5) forms

The first is simply done via this method or HTML -- it is done once so it doesn’t really matter. 

The second will use this method as the content area is dynamic and maintains state i.e. you can navigate to some other area and come back to where you were. 

Lists are built using a stdList component which in turn is built on this methodology. More to be said about that in another doc. 

Tab panels and individual tabs are also created via this methodology again another doc will described the API for such.

Forms can also be created using this methodology and support customized onchange events or a generalized handler -- just push the changes to the server for this model.

## $().html vs jsl.dom.add

jsl.dom.add is really a lot like the jQuery html() method except you are working with objects versus strings
