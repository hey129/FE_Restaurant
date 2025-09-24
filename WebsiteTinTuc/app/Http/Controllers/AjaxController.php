<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Category;
use App\SubCategory;
class AjaxController extends Controller
{
   public function getSub($idCategory)
   {
       $subcategory = SubCategory::where('idCategory',$idCategory)->get();
       foreach ($subcategory as $sc){
           echo "<option value='".$sc->id."'>$sc->Name</option>";
       } 
   }
}
