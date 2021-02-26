var TreeView=function(options)
{
	this.roots=[];
	this.containerSelector='#treeview';
	$.extend(this,options);
	if(options && typeof options.container=='string') 
		this.containerSelector=options.container;
	this.selectedNode=null;
};
TreeView.prototype.ParseJSON=function(tree)
{
	if(typeof tree==="string") tree=JSON.parse(tree);
	for(prop in tree)
	{
		if(typeof tree[prop] === 'number' || typeof tree[prop] === 'string' || typeof tree[prop] === 'boolean')
		{
			this[prop]=tree[prop];
		}
	}
	for(var i=0;i<tree.roots.length;i++)
	{
		var root=new TreeNode(tree.roots[i]);
		this.AddRoot(root);
	}
};
TreeView.prototype.Simplified=function()
{
	var tree={roots:[]};
	for(prop in this)
	{
		if(typeof this[prop] === 'number' || typeof this[prop] === 'string' || typeof this[prop] === 'boolean')
		{
			tree[prop]=this[prop];
		}
	}
	for(var i=0;i<this.roots.length;i++)
	{
		tree.roots.push(this.roots[i].Simplified());
	}
	return tree;
};
TreeView.prototype.AddRoot=function(node)
{
	node.SetTree(this);
	this.roots.push(node);
	return node;
};
TreeView.prototype.Show=function()
{
	if(!this.element) 
	{
		this.element=$("<div>");
		this.container=$(this.containerSelector);
		this.container.append(this.element);
	}
	for(var i=0;i<this.roots.length;i++)
	{
		this.roots[i].Show();
	}
};
TreeView.prototype.GetNodeById=function(id)
{
	for(var i=0;i<this.roots.length;i++)
	{
		if(this.roots[i].id==id) return this.roots[i];
		var result=this.roots[i].GetNodeById(id);
		if(result!=null) return result;
	}
	return null;
};
TreeView.prototype.OnSelect=function(callback)
{
	this._onSelect=callback;
};
var TreeNode=function(options)
{
	this.indent=20;
	this.parent=null;
	this.id=null
	this.label=null;
	this.collapsed=true;
	this.element=null;
	this.tree=null;
	this.selected=false;
	$.extend(this,options);
	this.children=[];
	if(options.children!=undefined)
	{
		for(var i=0;i<options.children.length;i++)
		{
			this.AddChild(new TreeNode(options.children[i]));
		}
	}
};
TreeNode.prototype.GetNodeById=function(id)
{
	for(var i=0;i<this.children.length;i++)
	{
		if(this.children[i].id==id) return this.children[i];
		else
		{
			var result=this.children[i].GetNodeById(id);
			if(result!=null) return result;
		}
	}
	return null;
};
TreeNode.prototype.Simplified=function()
{
	var node={children:[]};
	for(prop in this)
	{
		if(typeof this[prop] === 'number' || typeof this[prop] === 'string' || typeof this[prop] === 'boolean')
		{
			node[prop]=this[prop];
		}
	}
	for(var i=0;i<this.children.length;i++)
	{
		node.children.push(this.children[i].Simplified());
	}
	return node;
};
TreeNode.prototype.SetTree=function(tree)
{
	this.tree=tree;
	if(this.selected) tree.selectedNode=this;
	for(var i=0;i<this.children.length;i++)
	{
		this.children[i].SetTree(tree);
	}
};
TreeNode.prototype.Show=function()
{
	var expander,icon,label;
	if(!this.element) 
	{
		this.element=$("<div id='"+this.id+"'>").addClass("treeview-node");
		if(this.parent!=null)
			this.parent.element.append(this.element);
		else
			this.tree.element.append(this.element);
		expander=$("<span class='treeview-expander'></span>");
		icon=$("<span class='treeview-icon'></span>");
		label=$("<span class='treeview-label'>"+this.label+"</span>");
		this.element.append(expander).append(icon).append(label);
	}
	else
	{
		expander=this.element.children(".treeview-expander");
		icon=this.element.children(".treeview-icon");
		label=this.element.children(".treeview-label");
	}
	this.element.data("node",this);
	if(this.icon)
	{
		icon.css("background-image","url("+this.icon+")");
	}
	else if(this.children.length==0)
	{
		icon.addClass("treeview-icon-file");
		expander.removeClass("treeview-expander-minus").removeClass("treeview-expander-plus");
	}
	else if(this.collapsed)
	{
		expander.removeClass("treeview-expander-minus").addClass("treeview-expander-plus");
		if(!this.icon)
		{
			icon.removeClass("treeview-icon-file").removeClass("treeview-icon-opened").addClass("treeview-icon-closed");
		}
	}
	else
	{
		expander.removeClass("treeview-expander-plus").addClass("treeview-expander-minus");
		if(!this.icon)
		{
			icon.removeClass("treeview-icon-file").removeClass("treeview-icon-closed").addClass("treeview-icon-opened");
		}
	}
	this.element.css('margin-left',this.indent);
	if(this.selected) 
	{
		$(".treeview-node .treeview-node-selected").removeClass("treeview-node-selected");
		this.element.addClass("treeview-node-selected");
	}
	this.element.show();
	expander.off("click").on("click",function(){
		node=$(this).closest("div").data('node');
		if(node.collapsed) node.Expand();
		else node.Collapse();
	})
	label.off("click").on("click",function(){
		node=$(this).closest("div").data('node');
		node.Select();
	})	
	if(!this.collapsed)
	{
		this.Expand();
	}
};
TreeNode.prototype.Remove=function()
{
	this.element.remove();
	var parent=this.parent||this.tree;
	if(parent && parent.children.indexOf(this)>=0)
	{
		parent.children.splice(parent.children.indexOf(this),1);
	}
};
TreeNode.prototype.GetLevel=function()
{
	if(this.parent==null) return 0;
	else return this.parent.GetLevel()+1;
};
TreeNode.prototype.AddChild=function(childNode)
{
	childNode.parent=this;
	childNode.tree=this.tree;
	this.children.push(childNode);
	return childNode;
};
TreeNode.prototype.Expand=function()
{
	if(this.children.length==0) return;
	for(var i=0;i<this.children.length;i++)
	{
		this.children[i].Show();
	}
	this.element.children(".treeview-expander").removeClass("treeview-expander-plus").addClass("treeview-expander-minus");
	if(!this.icon)
	{
		this.element.children(".treeview-icon").removeClass("treeview-icon-closed").addClass("treeview-icon-opened");
	}
	this.collapsed=false;
};
TreeNode.prototype.Collapse=function()
{
	if(this.children.length==0) return;
	for(var i=0;i<this.children.length;i++)
	{
		this.children[i].element.hide();
	}
	this.element.children(".treeview-expander").addClass("treeview-expander-plus").removeClass("treeview-expander-minus");
	if(!this.icon)
	{
		this.element.children(".treeview-icon").removeClass("treeview-icon-opened").addClass("treeview-icon-closed");
	}
	
	this.collapsed=true;
};
TreeNode.prototype.OnSelect=function(callback)
{
	this._onSelect=callback;
};
TreeNode.prototype.Select=function()
{
	$(".treeview-node-selected").removeClass("treeview-node-selected");
	this.element.addClass("treeview-node-selected");
	this.selected=true;
	if(this.tree) 
	{
		if(this.tree.selectedNode)
		{
			this.tree.selectedNode.selected=false;
		}
		this.tree.selectedNode=this;
		this.tree.selectedNodeId=this.id;
	}
	if(this._onSelect!=undefined)
	{
		this._onSelect(this);
	}
	if(this.tree._onSelect!=undefined)
	{
		this.tree._onSelect(this);
	}
};
