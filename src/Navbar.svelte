<style>

.borders{  
    border-top:2px solid black;
    border-bottom:2px solid black;
}

.menuItemCustom{
    color:black; 
    font-weight:700;
}

.inputBoxCustom{
    border:black solid 2px; 
}

.searchButtonCustom{
    border:black solid 1px; 
    font-weight:700;
    background-color: black;
    color:white;
}

.searchButtonCustom:hover{ 
    background-color: red;
}

</style>

<div class="borders">

	<nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#ff3e00;">
	  <!--<a class="navbar-brand" href="#">Navbar</a>-->
	  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
	    <span class="navbar-toggler-icon"></span>
	  </button>

	  <div class="collapse navbar-collapse" id="navbarSupportedContent">
	    <ul class="navbar-nav mr-auto">

	      <li class="nav-item active">
	        <a class="nav-link" style="font-size:3vh;" href="index.html"><span style="color:black; font-weight:700;">Home &nbsp</span><span class="sr-only">(current)</span></a>
	      </li>

	      <li class="nav-item">
	        <a class="nav-link" style="font-size:3vh;" href="https://www.google.com"><span class="menuItemCustom" style="color:black; font-weight:700;">Set Up</span></a>
	      </li>

	      <li class="nav-item">
	        <a class="nav-link" style="font-size:3vh;" href="https://www.google.com"><span class="menuItemCustom">Menu 2 &nbsp</span></a>
	      </li>

	      <li class="nav-item">
	        <a class="nav-link" style="font-size:3vh;" href="https://www.google.com"><span class="menuItemCustom">Menu 3 &nbsp</span></a>
	      </li>

	      <li class="nav-item">
	        <a class="nav-link" style="font-size:3vh;" href="https://www.google.com"><span class="menuItemCustom">Menu 4 &nbsp</span></a>
	      </li>

	    </ul>

        <form class="form-inline my-2 my-lg-0">

            <input class="form-control mr-sm-2 inputBoxCustom" type="search" placeholder="Search" aria-label="Search">

            <button class="btn my-2 my-sm-0 searchButtonCustom" type="submit">Search</button>

        </form>

	  </div>
	</nav>

</div>

