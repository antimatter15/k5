# k5: backpropagation with react.js
## how to make things interactive without writing event handlers

WIth React, you define a render function which takes your application state and translates that into a Virtual DOM representation of your interface.

React applications translate application state into DOM elements. 


React can be thought of as a system which translates application state into DOM elements. Making a direct manipulation interface can be seen as running the render function backwards— being able to translate the movement of an element into a new application state. 









With React, your user interface is constructed as a function of the application state. 













React lets us build interfaces as functions of application state.
K5 lets you update the application state by direct manipulation of interface.















Lets say you start with a slider

	class SliderApp extends React.Component {
		constructor(){
			super()
			this.state = { value: "hello world!" }
		}
		render(){
			return <input type="range" value={this.state.value} />
		}
	}













There seem to be a few people on the internet who think React is a pretty cool thing. I think what makes React cool isn't so much any particular feature so much as how it makes you think. 

Back before we built things with React, we would build up a page and think about how parts of it would change in response to action— clicking that button should make that box appear, or hovering over that icon should slide this thing into view. 

But React's way of thinking almost ignores "change" altogether— instead you think of the interface as a function, something that maps some "state" into a visual representation. Actions just evolve the "state"— it's the "Virtual DOM" which automatically figures out how to change the page to match its new visual representation. 

But even in this brave new world of React, thinking about "change" hasn't been vanquished entirely, only replaced with its slightly more handsome younger cousin: thinking about how actions map to changes in the state.





Introducing K5: 












































