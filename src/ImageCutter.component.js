import React from 'react';
import './image_cutter.css';

class ImageCutter extends React.Component {
	constructor(props){
    	super(props);
    	this.refreshImageVars = this.refreshImageVars.bind(this);
		this.drawCutter = this.drawCutter.bind(this);
		this.getImage = this.getImage.bind(this);
		this.ok = this.ok.bind(this);
		this.draw = this.draw.bind(this);
		this.scrollCtrl = this.scrollCtrl.bind(this);
		this.zoomCtrl = this.zoomCtrl.bind(this);
		this.removeFromBody = this.removeFromBody.bind(this);

    	this.state = {
	      	callback:null,
		    image:null,
		    image_base64:null,
		    image_blob:null,
		    canvas_api:null,
		    scroll:null,
		    cutter:null,
	    	min_screen:null,
	    	max_screen:0,
	    	diameter:0,//square size or radius for cutter surface scrolling
	    	result_side:0,//square size of resulting image
		    zoom:0,
		    max_zoom:0,
		    min_zoom:0,
		    radius:0,
		    circle:{
		      radius:0,
		      x:0,
		      y:0
		    },
		    square:{
		      x:0,
		      y:0,
		      side:0
		    },
	    	src_width:0,
	    	src_height:0,
	    	ratio:0,
	    	out_width:0,
	    	out_height:0,
	    	result_image_width:0,
	    	result_image_height:0,
    	}
  	}
	refreshImageVars(){
		let state = this.state;
	    state.src_width = state.image.width;
	    state.src_height = state.image.height;
	    state.ratio = state.src_height/state.src_width;
	    state.out_width = 0;
	    state.out_height = 0;

	    
	    if(state.src_width > state.src_height){
	      state.out_height = state.square.side;
	      state.out_width = parseFloat((state.out_height/state.ratio).toFixed(2));
	      state.result_image_height = state.result_side;
	      state.result_image_width = parseFloat((state.result_image_height/state.ratio).toFixed(2));
	    }else{
	      state.out_width = state.square.side;
	      state.out_height = parseFloat((state.ratio*state.out_width).toFixed(2));
	      state.result_image_width = state.result_side;
	      state.result_image_height = parseFloat((state.ratio*state.result_image_width).toFixed(2));
	    }
	    this.setState(state);
	    this.forceUpdate(this.draw());
	}
  	drawCutter() {
  		let state = this.state;
	    state.cutter.width = state.out_width*state.zoom;
	    state.cutter.height = state.out_height*state.zoom;
	    const cutter_ctx = state.cutter.getContext("2d");
	    cutter_ctx.filter = 'blur(3px)';
	    cutter_ctx.drawImage(state.image, 0, 0, state.image.width, state.image.height,0,0,state.out_width*state.zoom,state.out_height*state.zoom);
	    cutter_ctx.filter = 'blur(0)';
	    cutter_ctx.arc(state.circle.x, state.circle.y, state.circle.radius, 0, 2 * Math.PI);
	    cutter_ctx.clip();
	    cutter_ctx.drawImage(state.image, 0, 0, state.image.width, state.image.height,0,0,state.out_width*state.zoom,state.out_height*state.zoom);
	    cutter_ctx.strokeStyle = 'rgba(255,255,255,0.5)';
	    cutter_ctx.lineWidth = 0;
	    cutter_ctx.stroke();
	    this.setState(state);
  	}
  	getImage() {
  		let state = this.state;
	    state.canvas_api.width = state.result_side;
	    state.canvas_api.height = state.result_side;
	    const rslt_ctx = state.canvas_api.getContext("2d");
	    
	    rslt_ctx.drawImage(state.image, state.square.x*(state.src_width/state.out_width)/state.zoom, state.square.y*(state.src_height/state.out_height)/state.zoom, state.image.width, state.image.height,0,0,state.result_image_width*state.zoom,state.result_image_height*state.zoom);
	    state.image_base64 = state.canvas_api.toDataURL();
	    this.setState(state);
  	}
  	async ok(){
  		let state = this.state;
	    await state.canvas_api.toBlob(blob=>{
	      state.callback({base64:state.image_base64,blob:blob});
	      this.setState(state);
	      this.removeFromBody();
	    });
  	}
  	draw() {
    	this.drawCutter();
    	this.getImage();
  	}
  	scrollCtrl(event){
  		let state = this.state;
    	const target = event.target;
    	state.circle.y = state.circle.radius + target.scrollTop;
    	state.circle.x = state.circle.radius + target.scrollLeft;
    	state.square.y = target.scrollTop;
	    state.square.x = target.scrollLeft;
	    // this.draw();
	    this.setState(state);
	    this.forceUpdate(this.draw());
  	}
	zoomCtrl(value){
	 	let state = this.state;
	    this.refreshImageVars();
	    const height_before = state.out_height*state.zoom;
	    const width_before = state.out_width*state.zoom;
	    if(state.zoom <= state.max_zoom && state.zoom >= state.min_zoom)
	      state.zoom += parseFloat(value);
	    if(state.zoom > state.max_zoom)
	      state.zoom = state.max_zoom;
	    if(state.zoom < state.min_zoom)
	      state.zoom = state.min_zoom;
	    const height_after = state.out_height*state.zoom;
	    const width_after = state.out_width*state.zoom;
	    //centering zoom
	    state.scroll.scrollTop += (height_after-height_before)*0.5;
	    state.scroll.scrollLeft += (width_after-width_before)*0.5;
	    
	    this.setState(state);
	    this.forceUpdate(this.draw());
	}
  	removeFromBody(){
  		if (typeof this.props.close === 'function')
  			this.props.close();
  	}
  	load(){
	  	let state = this.state;
	  	state.callback = this.props.callback;
	    state.image = new Image();
	    state.image.crossOrigin = "Anonymous";
	    state.image.onload = (e)=>{this.refreshImageVars()};
	    state.image.src = this.props.image_src;
	    state.canvas_api = document.createElement('canvas');
	    state.scroll = document.querySelector("#ic-scroll");
	    state.cutter = document.querySelector("#ic-cutter");

	    state.min_screen = Math.min(window.screen.width,window.screen.height);
	    state.max_screen = typeof this.props.width !== 'undefined'?parseFloat(this.props.width):400;
	    state.diameter = state.max_screen<state.min_screen?state.max_screen:state.min_screen;//square size or radius for cutter surface scrolling
	    state.scroll.style.width = (state.diameter+5)+'px';
	    state.scroll.style.height = (state.diameter+5)+'px';

	    state.result_side = parseFloat(this.props.side);//square size of resulting image

	    state.zoom = 1;
	    state.max_zoom = 5;
	    state.min_zoom = 1;
	    state.radius = (state.diameter / 2);

	    state.circle.radius = state.radius;
	    state.circle.x = state.radius;
	    state.circle.y = state.radius;

	    state.square.side = state.diameter;

	    state.src_width = state.image.width;
	    state.src_height = state.image.height;
	    state.ratio = state.src_height/state.src_width;
	    
	    this.setState(state);
  	}
  	componentDidMount(){
  		this.load();
  		this.refreshImageVars();
  	}
  	render() {
    	return (
	    	<div className="ic-background">
	          <div id="ic-scroll" className="ic-scroll" onScroll={event=>{this.scrollCtrl(event)}}>
	            <canvas id="ic-cutter"></canvas>
	            <div className="ic-buttons">
	              <span className="ic-button" style={{left:"5%"}} onClick={()=>{this.zoomCtrl(0.1)}}>+</span>
	              <span className="ic-button" style={{left:"15%"}} onClick={()=>{this.zoomCtrl(-0.1)}}>-</span>
	              <span className="ic-button" style={{left:"25%", transform:'rotateZ(45deg)'}} onClick={this.removeFromBody}>+</span>
	              <span className="ic-button" style={{left:"35%",fontSize:'inherit'}} onClick={()=>{this.ok()}}>ok</span>
	            </div>
	          </div>
	        </div>
    	);
  	}
}
export default ImageCutter;