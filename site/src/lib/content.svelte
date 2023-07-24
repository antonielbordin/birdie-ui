<script lang="ts" type="module">
   export let page: any
   
   import HighlightSvelte from '../lib/highlight.svelte'

   const accordionSingle = `
      <div class="bi-accordion">
         <div class="bi-accordion-tabs">
            <div class="bi-accordion-tab">
               <input type="radio" id="rd1" name="rd">
               <label class="bi-accordion-tab-label" for="rd1">Item 1</label>
               <div class="bi-accordion-tab-content">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
               </div>
            </div>
            <div class="bi-accordion-tab">
               <input type="radio" id="rd2" name="rd">
               <label class="bi-accordion-tab-label" for="rd2">Item 2</label>
               <div class="bi-accordion-tab-content">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
               </div>
            </div>
            <div class="bi-accordion-tab">
               <input type="radio" id="rd3" name="rd">
               <label for="rd3" class="bi-accordion-tab-close">Close others &times;</label>
            </div>
         </div>
      </div>
   `;
   const accordionMultiple = `
      <div class="bi-accordion">
         <div class="bi-accordion-tabs">
            <div class="bi-accordion-tab">
               <input type="checkbox" id="chck1">
               <label class="bi-accordion-tab-label" for="chck1">Item 1</label>
               <div class="bi-accordion-tab-content">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
               </div>
            </div>
            <div class="bi-accordion-tab">
               <input type="checkbox" id="chck2">
               <label class="bi-accordion-tab-label" for="chck2">Item 2</label>
               <div class="bi-accordion-tab-content">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
               </div>
            </div>
         </div>
      </div>
   `;
   const btnDefault = `
      <!-- Element Btn Default -->
      <button class="bi-btn">Default</button>

      <!-- Element Btn Default Disabled -->
      <button class="bi-btn" disabled>Default</button>
   `;
   const btnPrimary = `
      <!-- Element Btn Default -->
      <button class="bi-btn-primary">Default</button>

      <!-- Element Btn Default Disabled -->
      <button class="bi-btn-primary" disabled>Default</button>
   `;
   const btnSecondary = `
      <!-- Element Btn Secondary -->
      <button class="bi-btn-secondary">Secondary</button>

      <!-- Element Btn Secondary Disabled -->
      <button class="bi-btn-secondary" disabled>Secondary</button>
   `;
   const btnSuccess = `
      <!-- Element Btn Success -->
      <button class="bi-btn-success">Success</button>

      <!-- Element Btn Success Disabled -->
      <button class="bi-btn-success" disabled>Success</button>
   `;
   const btnDanger = `
      <!-- Element Btn Danger -->
      <button class="bi-btn-danger">Danger</button>

      <!-- Element Btn Danger Disabled -->
      <button class="bi-btn-danger" disabled>Danger</button>
   `;
   const btnWarning = `
      <!-- Element Btn Warning -->
      <button class="bi-btn-warning">Warning</button>

      <!-- Element Btn Warning Disabled -->
      <button class="bi-btn-warning" disabled>Warning</button>
   `;
   const btnInfo = `
      <!-- Element Btn Info -->
      <button class="bi-btn-info">Info</button>

      <!-- Element Btn Info Disabled -->
      <button class="bi-btn-info" disabled>Info</button>
   `;
   const btnLink = `
      <!-- Element Btn Link -->
      <button class="bi-btn-link">Link</button>

      <!-- Element Btn Link Disabled -->
      <button class="bi-btn-link" disabled>Link</button>
   `;
   const btnSmallAndLarge = `
      <!-- Element Btn Small -->
      <button class="bi-btn-primary bi-btn-small">Small</button>

      <!-- Element Btn Large -->
      <button class="bi-btn-primary bi-btn-large">Large</button>
   `;
   const btnRoundAndCircle = `
      <!-- Element Btn Round -->
      <button class="bi-btn-primary bi-btn-round">Round</button>

      <!-- Element Btn Circle -->
      <button class="bi-btn-primary bi-btn-circle">Circle</button>
   `;
   const cardDefault = `
      <!-- Element Card -->
      <div class="bi-card">
         <header class="bi-card-header">Header card</header>
         <section class="bi-card-content">This is content card</section>
      </div>
   `;
   const dropdownDefault = `
      <span class="bi-dropdown">
         <button>Action</button>
         <label>
            <input type="checkbox">
            <ul>
               <li>Action</li>
               <li>Another Action</li>
               <li>Test</li>
               <li class="bi-dropdown-divider"></li>
               <li>Separated link</li>
            </ul>
         </label>
      </span>
   `;
   const dataTable = `
      <div class="bi-datatable">
         <table id="bi-datatable">
            <thead>
               <tr>
                  <th scope="col">#</th>
                  <th scope="col">Data One</th>
                  <th scope="col">Data Two</th>
                  <th scope="col">Data Three</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td data-label="#">1</td>
                  <td data-label="Data One">Day</td>
                  <td data-label="Data Two">Wello</td>
                  <td data-label="Data Three">World!</td>                        
               </tr>
               <tr>
                  <td scope="row" >2</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
               <tr>
                  <td>3</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
               <tr>
                  <td>4</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
               <tr>
                  <td>5</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
               <tr>
                  <td>6</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
               <tr>
                  <td>7</td>
                  <td>Day</td>
                  <td>Hello</td>
                  <td>World!</td>
               </tr>
            </tbody>
         </table>                    
      </div>
   `;
   const elTextFieldStandard = `
      <!-- Element TextField Standard -->
      <span class="bi-textfield">
         <input placeholder="Standard">
      </span>

      <!-- Element TextField Standard Disabled -->
      <span class="bi-textfield">
         <input placeholder="Standard" disabled>
      </span>
   `;
   const elTextFieldOutlined = `
      <!-- Element TextField Outlined -->
      <span class="bi-textfield-outlined">
         <input placeholder=" ">
         <label>Outlined</label>
      </span>

      <!-- Element TextField Outlined Disabled -->
      <span class="bi-textfield-outlined">
         <input placeholder=" " disabled>
         <label>Outlined Disabled</label>
      </span>
   `;
   const elCheckbox = `
      <!-- Element Checkbox -->
      <span class="bi-checkbox">
         <input type="checkbox">
         <label>Checkbox</label>
      </span>

      <!-- Element Checkbox Disabled -->
      <span class="bi-checkbox">
         <input type="checkbox" disabled>
         <label>Checkbox Disabled</label>
      </span>
   `;
   const elRadio = `
      <!-- Element Radio -->
      <span class="bi-radio">
         <input type="radio">
         <label>Radio</label>
      </span>

      <!-- Element Radio Disabled -->
      <span class="bi-radio">
         <input type="radio" disabled>
         <label>Radio Disabled</label>
      </span>
   `;
   const elSwitch = `
      <!-- Element Switch -->
      <label class="bi-switch">
         <input type="checkbox">
         <span class="bi-slider-sw"></span>
      </label> 

      <!-- Element Switch -->
      <label class="bi-switch">
         <input type="checkbox" disabled>
         <span class="bi-slider-sw"></span>
      </label>
   `;
   const elSwitchRounded = `
      <!-- Element Switch Rounded-->
      <label class="bi-switch">
         <input type="checkbox">
         <span class="bi-slider-sw round"></span>
      </label> 

      <!-- Element Switch Rounded-->
      <label class="bi-switch">
         <input type="checkbox" disabled>
         <span class="bi-slider-sw round"></span>
      </label>
   `;
   const elSelect = `
      <!-- Element Select -->
      <div class="bi-select">
         <select name="bi-select-format" id="bi-select-format">
            <option selected disabled>Choose a content</option>
            <option value="one">Option One</option>
            <option value="two">Option Two</option>
            <option value="three">Option Three</option>
            <option value="four">Option Four</option>
            <option value="five">Option Five</option>
         </select>
      </div>

      <!-- Element Select Disabled -->
      <div class="bi-select" disabled>
         <select name="bi-select-format" id="bi-select-format" disabled>
            <option selected disabled>Choose a content</option>
            <option value="one">Option One</option>
            <option value="two">Option Two</option>
            <option value="three">Option Three</option>
            <option value="four">Option Four</option>
            <option value="five">Option Five</option>
         </select>
      </div>
   `;
   const tooltipTop = `
      <span data-bi="tooltip" bi-tooltip-pos="top" bi-tooltip="Top">Show Top</span>
   `;
   const tooltipRight = `
      <span data-bi="tooltip" bi-tooltip-pos="right" bi-tooltip="Right">Show Right</span>
   `;
   const tooltipLeft = `
      <span data-bi="tooltip" bi-tooltip-pos="left" bi-tooltip="Left">Show Left</span>
   `;
   const tooltipBottom = `
      <span data-bi="tooltip" bi-tooltip-pos="bottom" bi-tooltip="Bottom">Show Bottom</span>
   `;
   const typographyHeading = `
      <h1>h1. Birdie UI heading</h1>
      <h2>h2. Birdie UI heading</h2>
      <h3>h3. Birdie UI heading</h3>
      <h4>h4. Birdie UI heading</h4>
      <h5>h5. Birdie UI heading</h5>
      <h6>h6. Birdie UI heading</h6>
   `;
   const typographyHeadingClass = `
      <p class="bi-h1">h1. Birdie UI heading</p>
      <p class="bi-h2">h2. Birdie UI heading</p>
      <p class="bi-h3">h3. Birdie UI heading</p>
      <p class="bi-h4">h4. Birdie UI heading</p>
      <p class="bi-h5">h5. Birdie UI heading</p>
      <p class="bi-h6">h6. Birdie UI heading</p>
   `;
   const typographyTextTransform = `
      <p class="bi-uppercase">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-lowercase">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-capitalize">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-normal-case">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
   `;
   const typographyTextDecoration = `
      <p class="bi-overline">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-underline">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-line-through">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-underline-double">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-underline-dotted">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-underline-dashed">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-underline-wavy">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-no-decoration">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
   `;        
   const typographyTextAlignment = `
      <p class="bi-text-left">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-text-center">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-text-right">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
      <p class="bi-text-justify">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
      <p class="bi-text-start">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
      <p class="bi-text-end">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
   `;
   const dataTableImportsAndDefines = `   
      // Using the script tag to import and instantiate the 
      // BiDatatable class remembering to use the module type
      
      import BiDataTable from '/public/js/birdie-datatable'

      let datatable = new BiDataTable('bi-datatable', {
         showSearch: true, // Show search field,
         showSelect: true, // Show show select,
         showPaginate: true, // Show paginate ,
         selectionNumber: [5,10,20,50,100], // Change Option in Select
         hideColumn: ["City"], // Hide column
         showHighlight: false, // Show Highlight if search
         fixedTable: true, // Fixed table
         sortAnimate: false, // Show animated if sorted
         showTfoot: false, // Show footer
         excludeColumnExport: ["Name","City"] // Exclude columns in export table
      });      
   `;
   const addCdnCss = `
      <link href="https://cdn.jsdelivr.net/gh/stilosdesign/birdie-ui@1.0.0/birdie-ui.min.css" rel="stylesheet" crossorigin="anonymous">
   `;
   const addCdnJs = `
      <script src="https://cdn.jsdelivr.net/gh/stilosdesign/birdie-ui@1.0.0/birdie-ui.min.js" crossorigin="anonymous" />
   `;
</script>

{#if page == 'instalation'}
<div class="bi-container-fixed">  
   <header class="header-page hp-install">
      <span class="title"><span class="title-install">Start how you want</span></span>
      <span class="subtitle">
         Go straight to the build with Birdie UI
      </span>
      <span class="subtitle">
         Use the CDN, install it via the package manager or download the source code.
      </span>
   </header>   
   <div class="bi-row">
      <div class="bi-column install-birdie-ui">
         <div class="install-via-package">
            <p class="package-title">Install via package manager</p>
            <p>
               Install the Birdie UI source Css and JavaScript files via npm. 
               Package-managed installations do not include documentation or usage examples.
            </p>
            <p>To learn more about Birdie UI you can use the demo examples in the documentation menu.</p>
            <br><br>
            <span class="action-package">npm install birdie-ui</span>
         </div>       
       
         <div class="install-via-cdn">
            <p class="cdn-title">Include via CDN</p>
            <p>
               When you just want to include only the compiled Birdie UI 
               CSS or JS, you can use jsDelivr.
            </p>
            <div class="code-sample add-cdn">
               <HighlightSvelte lang="html" content="{addCdnCss}" />
            </div>
            <div class="code-sample add-cdn">
               <HighlightSvelte lang="html" content="{addCdnJs}" />
            </div>
         </div>
      </div>      
   </div>
</div>
{/if}

{#if page == 'accordions'}
<div class="bi-container-fixed space-top">  
   <header class="header-page">
      <span class="title"><span class="subli">Elements type accordion</span></span>
      <span class="subtitle">
         The Birdie UI accordion component is a collection of vertically 
         collapsed header and body elements that can be used to show and 
         hide information.
      </span>
   </header>   
   <!-- Element Accordion Single -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Accordion Single</div> 
            <div class="preview-enabled">
               <div class="bi-accordion">
                  <div class="bi-accordion-tabs">
                     <div class="bi-accordion-tab">
                        <input type="radio" id="rd1" name="rd">
                        <label class="bi-accordion-tab-label" for="rd1">Item 1</label>
                        <div class="bi-accordion-tab-content">
                           Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
                        </div>
                     </div>
                     <div class="bi-accordion-tab">
                        <input type="radio" id="rd2" name="rd">
                        <label class="bi-accordion-tab-label" for="rd2">Item 2</label>
                        <div class="bi-accordion-tab-content">
                           Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
                        </div>
                     </div>
                     <div class="bi-accordion-tab">
                        <input type="radio" id="rd3" name="rd">
                        <label for="rd3" class="bi-accordion-tab-close">Close others &times;</label>
                     </div>
                  </div>
               </div>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{accordionSingle}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Accordion Multiple -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Accordion Multiple</div> 
            <div class="preview-enabled">
               <div class="bi-accordion">
                  <div class="bi-accordion-tabs">
                     <div class="bi-accordion-tab">
                        <input type="checkbox" id="chck1">
                        <label class="bi-accordion-tab-label" for="chck1">Item 1</label>
                        <div class="bi-accordion-tab-content">
                           Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!
                        </div>
                     </div>
                     <div class="bi-accordion-tab">
                        <input type="checkbox" id="chck2">
                        <label class="bi-accordion-tab-label" for="chck2">Item 2</label>
                        <div class="bi-accordion-tab-content">
                           Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{accordionMultiple}" />
            </div>       
         </div>
      </div>       
   </div>   
</div>
{/if}

{#if page == 'buttons'}
<div class="bi-container-fixed space-top">  
   <header class="header-page">
      <span class="title"><span class="subli">Elements type button</span></span>
      <span class="subtitle">
         The button is probably one of the most used elements when building any web user interface, as it can be used to initiate an action as well as link to other pages.
         Birdie-UI provides a wide variety of styles and possibilities for the button component.
      </span>
      <span class="subtitle">
         Below are code samples with usage instructions.
      </span>
   </header>   
   <!-- Element Btn Default -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Default</div> 
            <div class="preview-enabled">
               <button class="bi-btn">Default</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn" disabled>Default</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnDefault}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Btn Primary -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Primary</div> 
            <div class="preview-enabled">
               <button class="bi-btn-primary">Primary</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-primary" disabled>Primary</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnPrimary}" />
            </div>     
         </div>
      </div>       
   </div>
   <!-- Element Btn Secondary -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Secondary</div> 
            <div class="preview-enabled">
               <button class="bi-btn-secondary">Secondary</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-secondary" disabled>Secondary</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnSecondary}" />
            </div>       
         </div>
      </div>       
   </div>   
    <!-- Element Btn Success -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Success</div> 
            <div class="preview-enabled">
               <button class="bi-btn-success">Success</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-success" disabled>Success</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnSuccess}" /> 
            </div>        
         </div>
      </div>       
   </div>
   <!-- Element Btn Danger -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Danger</div> 
            <div class="preview-enabled">
               <button class="bi-btn-danger">Danger</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-danger" disabled>Danger</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnDanger}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Btn Warning -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Warning</div> 
            <div class="preview-enabled">
               <button class="bi-btn-warning">Warning</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-warning" disabled>Warning</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnWarning}" />
            </div>         
         </div>
      </div>       
   </div>
   <!-- Element Btn Info -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Info</div> 
            <div class="preview-enabled">
               <button class="bi-btn-info">Info</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-info" disabled>Info</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnInfo}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Btn Link -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Link</div> 
            <div class="preview-enabled">
               <button class="bi-btn-link">Link</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-link" disabled>Link</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnLink}" />
            </div>      
         </div>
      </div>       
   </div>
   <!-- Element Btn Small/Large -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Small/Large</div> 
            <div class="preview-enabled">
               <button class="bi-btn-primary bi-btn-small">Small</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-primary bi-btn-large">Large</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnSmallAndLarge}" />
            </div>        
         </div>
      </div>       
   </div>
   <!-- Element Btn Round/Circle -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Button Round/Circle</div> 
            <div class="preview-enabled">
               <button class="bi-btn-primary bi-btn-round">Round</button>
            </div>
            <div class="preview-disabled">
               <button class="bi-btn-primary bi-btn-circle">Circle</button>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{btnRoundAndCircle}" /> 
            </div>        
         </div>
      </div>       
   </div>
</div>
{/if}

{#if page == 'cards'}
<div class="bi-container-fixed space-top">  
   <header class="header-page">
      <span class="title"><span class="subli">Elements type card</span></span>
      <span class="subtitle">
         You can submit entries from data and information with Birdie UI card components
      </span>
   </header>   
   <!-- Element Card -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Card</div> 
            <div class="preview-enabled">
               <div class="bi-card">
                  <header class="bi-card-header">Header card</header>
                  <section class="bi-card-content">This is content card</section>
               </div>
            </div>
         </div>        
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{cardDefault}" /> 
            </div>        
         </div>
      </div>       
   </div>
</div>
{/if}

{#if page == 'datatables'}
<div class="bi-container-fixed space-top">
   <header class="header-page">
      <span class="title"><span class="subli">Elements type DataTable</span></span>
      <span class="subtitle">
         Birdie UI datatable component can be used to display text, images, 
         links and other elements within a structured set of data. This 
         component can be used in two ways:
      </span>
      <span class="subtitle">
         As a simple table or as a datatable for this second option it is necessary 
         to import the corresponding javascript and apply the settings to 
         the id bi-datatable
      </span>
   </header>   
   <!-- Element Table Standard -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Table Standard</div> 
            <div class="preview-enabled full-table">
               <div class="bi-datatable">
                  <table>
                     <thead>
                        <tr>
                           <th scope="col">#</th>
                           <th scope="col">Data One</th>
                           <th scope="col">Data Two</th>
                           <th scope="col">Data Three</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td data-label="#">1</td>
                           <td data-label="Data One">Day</td>
                           <td data-label="Data Two">Wello</td>
                           <td data-label="Data Three">World!</td>                        
                        </tr>
                        <tr>
                           <td scope="row" >2</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>3</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>4</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>5</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>6</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>7</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                     </tbody>
                  </table>                    
               </div>
            </div>
         </div>        
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{dataTable}" /> 
            </div>        
         </div>
      </div>       
   </div>
   <!-- Element DataTable Standard -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">DataTable Standard</div> 
            <div class="preview-enabled full-table">
               <div class="bi-datatable">
                  <table id="bi-datatable">
                     <thead>
                        <tr>
                           <th scope="col">#</th>
                           <th scope="col">Data One</th>
                           <th scope="col">Data Two</th>
                           <th scope="col">Data Three</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td data-label="#">1</td>
                           <td data-label="Data One">Day</td>
                           <td data-label="Data Two">Wello</td>
                           <td data-label="Data Three">World!</td>                        
                        </tr>
                        <tr>
                           <td scope="row" >2</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>3</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>4</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>5</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>6</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                        <tr>
                           <td>7</td>
                           <td>Day</td>
                           <td>Hello</td>
                           <td>World!</td>
                        </tr>
                     </tbody>
                  </table>                    
               </div>
            </div>
         </div>        
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{dataTable}" /> 
            </div>                
            <div class="code-sample" style="margin-top: 10px;">
               <HighlightSvelte lang="javascript" content="{dataTableImportsAndDefines}" /> 
            </div>         
         </div>
      </div>       
   </div>
</div>
{/if}

{#if page == 'dropdowns'}
<div class="bi-container-fixed space-top">
   <header class="header-page">
      <span class="title"><span class="subli">Elements type Dropdowns</span></span>
      <span class="subtitle">
          
      </span>
   </header>   
   <!-- Element Dropdown Default -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Dropdown Default</div> 
            <div class="preview-enabled">
               <span class="bi-dropdown">
                  <button>Action</button>
                  <label>
                     <input type="checkbox">
                     <ul>
                        <li>Action</li>
                        <li>Another Action</li>
                        <li>Test</li>
                        <li class="bi-dropdown-divider"></li>
                        <li>Separated link</li>
                     </ul>
                  </label>
               </span>
            </div>                           
         </div>
         <div class="code-syntax-wrapper"> 
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{dropdownDefault}" />
            </div>
         </div>
      </div>       
   </div>   
</div>
{/if}

{#if page == 'forms'}
<div class="bi-container-fixed space-top">  
   <header class="header-page">
      <span class="title"><span class="subli">Elements type Form</span></span>
      <span class="subtitle">
         The forms have several types of components which can be input boxes, 
         check boxes, radios, textarea, among others and are useful to collect 
         information from users.
         With Birdie UI you have at your disposal a kit with valuable components 
         to create rich web applications.
      </span>
   </header>   
   <!-- Element TextField Standard -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">TextField Standard</div> 
            <div class="preview-enabled">
               <span class="bi-textfield">
                  <input placeholder="Standard">
               </span>
            </div>  
            <div class="preview-disabled">
               <span class="bi-textfield">
                  <input placeholder="Standard" disabled>
               </span>
            </div>             
         </div>
         <div class="code-syntax-wrapper"> 
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elTextFieldStandard}" />
            </div>
         </div>
      </div>       
   </div>
   <!-- Element TextField Outlined -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">TextField Outlined</div> 
            <div class="preview-enabled">
               <span class="bi-textfield-outlined">
                  <input placeholder=" ">
                  <label>Outlined</label>
               </span>
            </div>
            <div class="preview-disabled">
               <span class="bi-textfield-outlined">
                  <input placeholder=" " disabled>
                  <label>Outlined Disabled</label>
               </span>
            </div>
         </div>
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elTextFieldOutlined}" />         
            </div>
         </div>
      </div>       
   </div>
   <!-- Element Checkbox -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Checkbox</div> 
            <div class="preview-enabled">
               <span class="bi-checkbox">
                  <input type="checkbox">
                  <label>Checkbox</label>
               </span>
            </div>
            <div class="preview-disabled">
               <span class="bi-checkbox">
                  <input type="checkbox" disabled>
                  <label>Checkbox Disabled</label>
               </span>
            </div> 
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elCheckbox}" />         
            </div>
         </div>
      </div>       
   </div>
   <!-- Element Radio -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Radio</div> 
            <div class="preview-enabled">
               <span class="bi-radio">
                  <input type="radio">
                  <label>Radio</label>
               </span>
            </div>
            <div class="preview-disabled">
               <span class="bi-radio">
                  <input type="radio" disabled>
                  <label>Radio Disabled</label>
               </span>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elRadio}" />         
            </div>
         </div>
      </div>       
   </div>
   <!-- Element Switch -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Switch</div> 
            <div class="preview-enabled">
               <label class="bi-switch">
                  <input type="checkbox">
                  <span class="bi-slider-sw"></span>
               </label> 
            </div>
            <div class="preview-disabled">
               <label class="bi-switch">
                  <input type="checkbox" disabled>
                  <span class="bi-slider-sw"></span>
               </label>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elSwitch}" />         
            </div>
         </div>
      </div>       
   </div>
   <!-- Element Switch Rounded -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Switch Rounded</div> 
            <div class="preview-enabled">
               <label class="bi-switch">
                  <input type="checkbox">
                  <span class="bi-slider-sw round"></span>
               </label> 
            </div>
            <div class="preview-disabled">
               <label class="bi-switch">
                  <input type="checkbox" disabled>
                  <span class="bi-slider-sw round"></span>
               </label>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elSwitchRounded}" />         
            </div>
         </div>
      </div>       
   </div>
   <!-- Element Select -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Select</div> 
            <div class="preview-enabled">
               <div class="bi-select">
                  <select name="bi-select-format" id="bi-select-format">
                     <option selected disabled>Choose a content</option>
                     <option value="one">Option One</option>
                     <option value="two">Option Two</option>
                     <option value="three">Option Three</option>
                     <option value="four">Option Four</option>
                     <option value="five">Option Five</option>
                  </select>
               </div>
            </div>
            <div class="preview-disabled">
               <div class="bi-select" disabled>
                  <select name="bi-select-format" id="bi-select-format" disabled>
                     <option selected disabled>Choose a content</option>
                     <option value="one">Option One</option>
                     <option value="two">Option Two</option>
                     <option value="three">Option Three</option>
                     <option value="four">Option Four</option>
                     <option value="five">Option Five</option>
                  </select>
               </div>
            </div>
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{elSelect}" />         
            </div>
         </div>
      </div>       
   </div>
</div>
{/if}

{#if page == 'layouts'}
<section class="content-page space-top">   
    <h2><span class="title-box">Contained Grid</span></h2> 
    <div class="bi-container bg-container">
       <!-- Columns 100% width -->
       <div class="bi-row space-top">
          <div class="bi-column col"> 100% </div>
       </div>

       <!-- Columns 50% width -->
       <div class="bi-row">
          <div class="bi-column col"> 50% </div>
          <div class="bi-column col"> 50% </div>
       </div>

       <!-- Columns 33.3% width -->
       <div class="bi-row">
          <div class="bi-column col"> 33.3% </div>
          <div class="bi-column col"> 33.3% </div>
          <div class="bi-column col"> 33.3% </div>
       </div>

       <!-- Columns 25% width -->
       <div class="bi-row">
          <div class="bi-column col"> 25% </div>
          <div class="bi-column col"> 25% </div>
          <div class="bi-column col"> 25% </div>
          <div class="bi-column col"> 25% </div>
       </div>
    </div>

    <!-- Contained Grid Fixed -->
    <h2><span class="title-box">Contained Grid Fixed</span></h2>
    <div class="bi-container-fixed bg-container">
       <!-- Columns 25% and 75% width -->
       <div class="bi-row space-top">
          <div class="bi-column col-25 col"> Twenty Five Percent </div>
          <div class="bi-column col-75 col"> Seventy Five Percent </div>
       </div>
    </div>
</section>
{/if}

{#if page == 'modals'}
{/if}

{#if page == 'tooltips'}
<div class="bi-container-fixed space-top">
   <header class="header-page">
      <span class="title"><span class="subli">Elements type Tooltip</span></span>
      <span class="subtitle">
         The tooltip component is one of the most common features in modern web building and can be used as a tool to display tips, show extra content on hover or focus on an element.
         Check out the possibilities within the Birdie UI.
      </span>
   </header>   
   <!-- Element Tooltip Top -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Tooltip Top</div> 
            <div class="preview-enabled">
               <span style="padding: 3px" data-bi="tooltip" bi-tooltip-pos="top" bi-tooltip="Top">Show Top</span>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{tooltipTop}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Tooltip Right -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Tooltip Right</div> 
            <div class="preview-enabled">
               <span style="padding: 3px" data-bi="tooltip" bi-tooltip-pos="right" bi-tooltip="Right">Show Right</span>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{tooltipRight}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Tooltip Left -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Tooltip Left</div> 
            <div class="preview-enabled">
               <span style="padding: 3px" data-bi="tooltip" bi-tooltip-pos="left" bi-tooltip="Left">Show Left</span>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{tooltipLeft}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Element Tooltip Bottom -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Tooltip Bottom</div> 
            <div class="preview-enabled">
               <span style="padding: 3px" data-bi="tooltip" bi-tooltip-pos="bottom" bi-tooltip="Bottom">Show Bottom</span>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{tooltipBottom}" />
            </div>       
         </div>
      </div>       
   </div>



</div>
{/if}

{#if page == 'typography'}
<div class="bi-container-fixed space-top">
   <header class="header-page">
      <span class="title"><span class="subli">Elements type Typography</span></span>
      <span class="subtitle">
         Birdie UI typography is primarily used to style textual elements.
      </span>
      <span class="subtitle">
         Check out all the predefined options and utility classes that you can use.
      </span>
   </header>   
   <!-- Typographic Element - Headings -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Headings</div> 
            <div class="preview-enabled" style="width: 100%;">
               <h1>h1. Birdie UI heading</h1>
               <h2>h2. Birdie UI heading</h2>
               <h3>h3. Birdie UI heading</h3>
               <h4>h4. Birdie UI heading</h4>
               <h5>h5. Birdie UI heading</h5>
               <h6>h6. Birdie UI heading</h6>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{typographyHeading}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Typographic Element - Class that represents the headings -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">.bi-h1 through .bi-h6 classes are also available, for when you want to match the font styling of a heading but cannot use the associated HTML element.</div> 
            <div class="preview-enabled" style="width: 100%;">
               <p class="bi-h1">h1. Birdie UI heading</p>
               <p class="bi-h2">h2. Birdie UI heading</p>
               <p class="bi-h3">h3. Birdie UI heading</p>
               <p class="bi-h4">h4. Birdie UI heading</p>
               <p class="bi-h5">h5. Birdie UI heading</p>
               <p class="bi-h6">h6. Birdie UI heading</p>
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{typographyHeadingClass}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Typographic Element - Class that represents the text transformation -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Class that represents the text transformation</div> 
            <div class="preview-enabled" style="width: 100%;">
               <p class="bi-uppercase">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-lowercase">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-capitalize">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-normal-case">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{typographyTextTransform}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Typographic Element - Class that represents the text decoration and its styles -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Class that represents the text decoration and its styles</div> 
            <div class="preview-enabled" style="width: 100%;">
               <p class="bi-overline">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-underline">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-line-through">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-underline-double">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-underline-dotted">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-underline-dashed">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-underline-wavy">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-no-decoration">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{typographyTextDecoration}" />
            </div>       
         </div>
      </div>       
   </div>
   <!-- Typographic Element - Class that represents the text alignment -->
   <div class="bi-row">
      <div class="bi-column">
         <div class="code-preview-wrapper">
            <div class="preview-title">Class that represents the text alignment</div> 
            <div class="preview-enabled" style="width: 100%;align-items:normal">
               <p class="bi-text-left">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-text-center">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-text-right">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>
               <p class="bi-text-justify">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
               <p class="bi-text-start">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
               <p class="bi-text-end">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum, reiciendis!</p>            
            </div>            
         </div> 
         <div class="code-syntax-wrapper">
            <div class="code-sample">
               <HighlightSvelte lang="html" content="{typographyTextAlignment}" />
            </div>       
         </div>
      </div>       
   </div>
</div>
{/if} 

<style>
   .space-top {
      margin-top: 60px;
   }
   .hp-install {
      margin-top: 130px;
   }
   .title-install {
      font-size: 42px;
      font-weight: bold;
   }
   .install-birdie-ui {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;
      width: 100%;
      min-height: 40px;
      margin-bottom: 35px;
   }
   .install-via-package {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 25px;
   }
   .install-via-cdn {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding:25px
   }
   .package-title,
   .cdn-title {
      font-size: 32px;
      color: #414141;
      font-weight: bold;
   }
   .action-package {
      padding: 15px 25px;
      background: #28324E;
      color: #f6f6f6;
      border-radius: 4px;
      margin-top: 25px;
      width: 40%;
   }
   .add-cdn {
      margin-top: 25px;
   }
</style>