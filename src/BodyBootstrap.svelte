<script>
let string_001 = '< abcxyz />';

</script>

<style>

div{ 
border-top:solid 2px black;
}

</style>

<div class="container-fluid mt-5 mb-5">

    <div class="row">
        <div id="support" style="" class="col-sm-12 col-md-12 col-lg-12 col-xl-12">
            <h1 class="mt-5">Support</h1>
            <br>
            <p class="textA">This Svelte tutorial and bolierplate is free but your support would be greatly appreciated!
            <br>   
            <br>
            We have these really cool Svelte drink coasters on <a href="https://www.etsy.com/listing/712925864/coasters-svelte-javascript-framework?ref=shop_home_active_9&frs=1">Esty</a> as well as other cool programming drink coasters. Please stop by the Etsy store and purchase a couple of coasters! Your support really helps!
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/svelteCoaster.jpg" alt=""><br>
            <img class="img1" src="ASSETS/IMAGES/mink2.jpg" alt=""><br>
            <img class="img1" src="ASSETS/IMAGES/mink.jpg" alt=""><br>
            <br>
            <br>
            Purchase <a href="https://www.etsy.com/listing/712925864/coasters-svelte-javascript-framework?ref=shop_home_active_9&frs=1">here on Esty.</a>
            <br>
            <br>
            </p>
            <h1 class="mt-5">Now for the tutorial...</h1>
        </div>
 
        <div id="setUp" style="" class="col-sm-12 col-md-12 col-lg-12 col-xl-12">
            <h1 class="mt-5">Set Up</h1>
            <br>
            <p class="textA">To get started you will need the following things installed:<br>
            - An IDE (Integrated Development Environment) - I will be using Visual Studio Code<br>
            - Node JS<br>
            - The Svelte Starter Zip File
            <br>
            <br>
            <b><u>Setting up Node JS</u></b><br>
            1. Go to <a href="https://nodejs.org/en/">https://nodejs.org/en/</a> and download the latest version of Node JS.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/nodeJs.png" alt="">
            <br>
            <br>
            2. Follow the default prompts and install Node JS.
            <br>
            <br>
            3. Run Node JS by clicking the Node JS icon. 
            <br>
            <br>
            <b><u>Setting up Visual Studio Code</u></b><br>
            1. Go to <a href="https://code.visualstudio.com/">https://code.visualstudio.com/</a> and download the latest version of Visula Studio Code.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/VS_CODE.png" alt="">
            <br>
            <br>
            2. Follow the default prompts and install Visual Studio Code.
            <br>
            <br>
            3. Open Visual Studio Code and install the Svelte extension. It isn’t mandatory but this will help with auto-completion and colorization for better ease of use. To open the extension menu, click on the "boxes" menu. 
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/extensions.png" alt="">
            <br>
            <br>
            Then type in 'Svelte' in the search bar. You should see 'Svelte x.x.x - Svelte language support for VS Code'; click on that and install the extension.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/extensions_2.png" alt="">
            <br>
            <br>
            <b><u>Download the Svlete Starter Zip File </u></b><br>
            1. Go to <a href="https://svelte.dev/repl/">https://svelte.dev/repl/</a> and download the latest version of the Svlete Starter Zip File. In the upper right-hand corner, you will see a download icon for the starter zip file. It’s HARD to find but I’ve marked it in red.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/SvletStarterZip.png" alt="">
            <br>
            <br>
            2. Extract it to a folder of your choosing.
            <br>
            <br>
            3. For Windows users, delete the _MACOSX file as this is for Apple users.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Extract.png" alt="">
            <br>
            <br>            
            4. Take all the contents from the ‘project-setup’ folder and put them into your project folder. Your project folder should look something like this:
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_01a.png" alt="">
            <br>
            <br>            
            5. So now you have everything set up to do the initial "Hello World!"
            </p>

        </div>

        <div id="helloWorld" style="" class="col-sm-12 col-md-12 col-lg-12 col-xl-12">
            <h1 class="mt-5">Hello World</h1>
            <br>

            <p class="textA">
            <b><u>Your First Hello World</u></b><br>
            1. Open the Visual Studio Code and open the project folder.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_02.png" alt="">
            <br>
            <br>  
            2. Expand out the folder navigator to see the folder & file structure.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_03.png" alt="">
            <br>
            <br>  
            3. Open the terminal pane, If you are new to visual studio, to open the terminal click on ‘View’ on the menu and then ‘Terminal’ 
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_04.png" alt="">
            <br>
            <br>  
            4.The terminal command line pane will be at the bottom. Here you can type in commands.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/terminal.png" alt="">
            <br>
            <br>             
            5. We will now need to install Node JS into the project. To do this you will use the command line. Type in ‘npm install’ into the command line; this will install and associate an instance of NPM with this project. You can also use other command lines outside of Visual Studio’s terminal command line but just be sure you cd into the correct project folder.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_05.png" alt="">
            <br>
            <br> 
            Now a folder called "node_modules" should appear in the Explorer section; it is now associated with the project.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/Hello_World_06.png" alt="">
            <br>
            <br> 
            6. Click on package.json and view the file
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/pckgJSON.png" alt="">
            <br>
            <br> 
            7. Referencing  the commands, type in ‘npm run dev’ in the command line; this will get the Node JS local serving going on your computer; it is required for you to view your Svelte app. The dev command starts your dev environment as well as allow an auto compile function any time you save your project. This is very convenient because it automatically updates your app in the browser.
            <br>
            <br>  
            <img class="img1" src="ASSETS/IMAGES/Hello_World_08.png" alt="">
            <br>
            <br> 
            8. Go to your browser and type in 'localhost:5000' – to view your new Hello World app!
            <br>
            <br>  
            <img style="border:2px solid black;" class="img1" src="ASSETS/IMAGES/Hello_World_10.png" alt="">
            <br>
            <br>   
            </p>

        </div>

        <div id="howItWorks" style="" class="col-sm-12 col-md-12 col-lg-12 col-xl-12">
            <h1 class="mt-5">How It Works</h1>

            <p class="textA">
            <b><u>The Structure of the Svelte Project</u></b><br>
            1. In the Hello World project open the following files:
            <br>
            <br>
            - index.html<br>
            - global.css<br>
            - bundle.css<br>
            - bundle.js<br>
            - main.js<br>
            - App.svelte<br>
            - package.json 
            <br>
            <br>
            If you have some experience with things like React, Angular and View, Svelte should be intuitive for you. If you haven’t used those technologies before OR you are stepping up from basic HTML, CSS and Javascript, Svelte can be a little awkward at first. After doing a little bit of development with Svelte, you will understand why it is a great technology, how it helps organize your code into manageable chunks and compiles your code down into tiny file sizes!
            <br>
            <br>
            Below is a basic flow path diagram that gives you the high-level overview of how the all the main files relate to each other.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/SvelteFlowPath.png" alt="">
            <br>
            <br>  
            Starting with the index.html using the “top down thinking” reading the file, you’ll see it’s like any HTML file. When this file is read, the browser will read all CSS and JS files and Content Delivery Network(s) (CDN’s)you have linked.
            <br>
            <br> 
            <img class="img1" src="ASSETS/IMAGES/HIW_01.png" alt="">
            <br>
            <br> 
            At the end of the before the closing head tag you will see 'script defer src='/bundle.js'/script'; this will call the bundle.js file.
            <br>
            <br> 
            The bundle.js file is the file that Svelte generates when it compiles all of your projects files and code. What’s really neat about this is that it generates a very small file of optimized JavaScript that will help with website performance.    
            <br>
            <br> 
            If you look at the first few lines of the bundle.js you will see: <br>
            var app = (function () ...
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/HIW_02.png" alt="">
            <br>
            <br>  
            The variable ‘app’ is found in the main.js file where it is instantiated. Basically, the bundle.js invokes the main.js file – if you remember the basics of programming, the entry point for programs starts with a main function and in this case,  main.js file is sort of a “gateway” file.
            <br>
            <br> 
            Looking at the main.js file, you will see in the code:
            <br>
            <br> 
            import App from './App.svelte';<br>
            var app = new App(<br>
	        target: document.body....<br>
            <br>
            <br> 
            <img class="img1" src="ASSETS/IMAGES/HIW_03.png" alt="">
            <br>
            <br> 
            What is happening here is that the main.js file is calling (known as invoking) the App.svelte file.
            <br>
            <br> 
            Next, looking at the App.Svelte file, this file is where you “link in” all of the components for your application. If you have used php and separated your website components and used ‘require’ or ‘include’ and/or if you have used Microsoft Razor Pages in ASP.NET Core, it’s the same principle. At the top you will need to import each component with script tags and then  in the body of the file, you will call them with the simple {string_001} tag. The image below is from a boiler plate I built out before writing this guide.
            <br>
            <br> 
            <img class="img1" src="ASSETS/IMAGES/HIW_04.png" alt="">
            <br>
            <br> 
            And for each component you want make, you will create a ‘.svelte’ file under the 'src' folder and put that component’s code in there. The image below is taken from a boiler plate project I made before this guide and is an example of compenentization techniques.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/HIW_05.png" alt="">
            <br>
            <br> 
            For each ‘.svelte’ file you create, you can put scripts and css at the top of the file. This may seem a little awkward if you are used to basic HTML, CSS and JS coding but it’s really awesome and helps with code management. No longer will you have to make separate JS and CSS files all over the place – you can keep your code nice and tidy. And what is really cool is that when the file is compiled, the JS and CSS will only be applied to that component, not the entire project (known as globally).  With this in mind, you will still need to remember that there is a global.css file back in the index.html head that will affect all files in the project, so do mind the CSS styles and JavaScript you have there that my cause issues.
            <br>
            <br> 
            <img class="img1" src="ASSETS/IMAGES/HIW_06.png" alt="">
            <br>
            <br> 


        </div>

        <div id="components" style="" class="col-sm-12 col-md-12 col-lg-12 col-xl-12">
            <h1 class="mt-5">Components</h1>
            <br>
            <p class="textA">
            <b><u>The Concept of "Components" and "Component-ization"</u></b><br>
            If you are familiar with ‘components’ and ‘component-ization,’ go ahead and skip this section. 
            <br>
            <br>
            Making components and putting them into your app is fairly straightforward once you get the hang of it. If ‘component(s)’  and ‘component-ization’ is a new term and concept for you coming from basic HTML, CSS and JS, think of components as blocks of your divs and sections of the website or app.  
            <br>
            <br>    
            After building out ‘pre_Componentize.html’ file, you can see it has 159 lines of code to go through. This website has a total of 6 pages, so if you copied and pasted the same code over again into each file, you now have 954 lines of code to work though, each file being really long. 
            <br>
            <br>            
            So let’s ‘component-ize’ a basic HTML page into separate parts from the top down; you have  your head, header, navigation/menu, body, parts within your body, and the footer.           
            <br>
            <br>              
            <img class="img1" src="ASSETS/IMAGES/y1.png" alt="">    
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/componentA.png" alt="">    
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/componentB.png" alt="">    
            <br>
            <br>
            Instead of writing everything in one long file... 
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/long.png" alt="">
            <br>
            <br>
            you break up each section and put each section’s code into individual files with PHP. 
            <br>
            <br>
            <img style="width:30%;" src="ASSETS/IMAGES/w2.png" alt=""> 
            <br>
            <br>
            If you use PHP and restructure the code (also called refactoring/ refactor the code), you can break it down into smaller files spread out in separate folders, which makes it easier to manage the code. Each file is called by the PHP 'include' function.         
            <br>
            <br>    
            <img class="img1" src="ASSETS/IMAGES/z4.png" alt="">  
            <br>
            <br> 
            It is a common naming practice for PHP developers to have an 'includes' folder where all of the components are organized. Note ** You don't have to explicity call the file 'includes', you could name it 'cat' and so long as the file path is correct, it will work. **
            <br>
            <br>
            So now the head, the header, the navbar, and the footer have their own separate files which makes it easier to manage. And you can simply use the PHP include function in each of the pages for your website.
            <br>
            <br>
            <img class="img1" src="ASSETS/IMAGES/z6.png" alt="">
            <img class="img1" src="ASSETS/IMAGES/z7.png" alt="">
            <img class="img1" src="ASSETS/IMAGES/z8.png" alt="">
            <img class="img1" src="ASSETS/IMAGES/z9.png" alt="">
            <br>
            <br>
            By componentizing this example, you go from 950+ lines of code and lot of repeated code to around 450 unique lines of code for just the page content and 84 lines combined for the head, header, navbar and the footer; the total being around 534 lines. So by componentizing, you reduce the number of lines of code in the project, make the code easier to manage, save hard drive/ server space and improve the performance of your website.
            <br>
            <br>  
            As a beginner, you may find this awkward, confusing and frustrating because your code is not in one file but once you adopt this practice of breaking up the code into smaller chunks, it makes development a whole lot easier and faster. I really suggest that as soon as you learn HTML, learn the PHP ‘include’ and ‘require’ function and how to “Object Orient” your code as it will help with more advanced things like React, Svelte and C#/ .NET. 
            <br>
            <br>      
            <b><u>Making Components in Svelte</u></b><br>
            1. Lorem Ipsum dolor....
            <br>
            <br>
            <!--<img class="img1" src="ASSETS/IMAGES/Hello_World_02.png" alt="">-->
            <br>
            <br>

            </p>
        </div>
        
    </div>

</div>