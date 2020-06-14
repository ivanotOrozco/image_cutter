# image-cutter

React.js component to cut an image and generate a square image from it.
Useful to edit profile images before saving

## Install
    npm i image-cutter
[https://www.npmjs.com/package/image-cutter](https://www.npmjs.com/package/image-cutter)

## Usage

On your component import:

    import  ImageCutter  from  "image-cutter";
Call de component:

    <ImageCutter
	    image_src = { image_source }
	    side = "400"
	    callback = { callback_funtion }
	    close = { close_function }
	    width = "400"
	/>
|property|  description|
|--|--|
|image_src| image source like base 64|
|side| side size of resulting image |
|callback| your function to handling the result. ImageCutter return a object like `{base64:base64_string, blob:blob}` on the callback funtion param. ejm `function myCallback(result_obj){...}`
|close| your function to what to do after get the result of ImageCutter
|width| size of cutter, width and height of `<div/>` that show the image to cut

*note: image_src must be a local source to avoid cross origin constraint. If you want to get the cut from external image first you can get the data through Fetch and take the base64 result then pass it to ImageCutter*



## Example

   

   

       import  React  from  "react";
       import  ImageCutter  from  "image-cutter";
        
       export  default  class  App  extends  React.Component {
	       constructor(props) {
		   super(props);
		   this.callback  =  this.callback.bind(this);
		   this.click  =  this.click.bind(this);
		   this.state  = {
			    img_src:"data:image/jpeg;base64,/9j/.....",
			    img_rslt: "",
				image_cutter:  false
		   };
	   }
	    callback(rslt) {
		    console.log(rslt);
		    this.setState({ img_rslt:  rslt.base64 });
	    }
	    click() {
		    this.setState({ image_cutter:  !this.state.image_cutter });
	    }
	    render() {
		    return (
			    <div  className="App">
					<img
					    src={this.state.img_src}
					    onClick={this.click}
				    />
				    <p>click/tap on image, select and see the result below.</p>
				    {(() => {
					    if (this.state.image_cutter) {
						    return (
							    <ImageCutter
								    image_src={this.state.img_src}
								    side="400"
								    callback={this.callback}
								    close={this.click}
								    width="400"
							    />
						    );
					    }
					    return  null;
					})()}
					<img  src={this.state.img_rslt} alt=""  />
			    </div>
		    );
	    }
	}

watch it working on sandbox:
https://codesandbox.io/s/image-cutter-0v2he?file=/src/App.js:0-41414

## How it work?

In depth is the html5 Canvas API that does the job. The source image to cut is instantiated in a javacript Image object after a Canvas api is instantiated with the image object before created and the square image is drawn on the canvas, at the end, the result is returned using the api function Canvas to get base64 and blob.

html, css and javascript main idea: [https://codepen.io/ivanot/pen/GRpYVxm](https://codepen.io/ivanot/pen/GRpYVxm)

## Style
These are the CSS classes, feel free to overwrite.
"ic" is for **i**mage **c**utter

    .ic-scroll{
      ...
    }
    .ic-scroll > canvas{
      ...
    }
    .ic-scroll::-webkit-scrollbar {
      ...
    }
    .ic-scroll::-webkit-scrollbar-button {
      ...
    }
    .ic-scroll::-webkit-scrollbar-thumb {
      ...
    }
    .ic-scroll::-webkit-scrollbar-track {
     ...
    }
    
    .ic-scroll::-webkit-scrollbar-corner {
      ...
    }
    .ic-button{
      ...
    }
    .ic-buttons{
      ...
    }
    .ic-background{
     ...
    }

