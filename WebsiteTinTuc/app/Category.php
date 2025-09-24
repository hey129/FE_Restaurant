<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
   protected $table = "Category";
   public function SubCategory()
   {
      return $this->hasMany('App\SubCategory','idCategory','id');
   }
   public function News()
   {
      return $this->hasManyThrough('App\News','App\SubCategory','idCategory','idSubcategory');
   }
}
