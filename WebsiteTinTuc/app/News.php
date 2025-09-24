<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
   protected $table ="News";

   public function SubCategory(){
      return $this->belongsTo('App\Subcategory','idSubcategory','id');
   }
   
   public function Comment(){
      return $this->hasMany('App\Comment','idNews','id');
   }
}
