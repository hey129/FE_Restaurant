<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    protected $table = "SubCategory";

    public function Category()
    {
        return $this->belongsTo('App\Category','idCategory','id');
    }
    public function News()
    {
        return $this->hasMany('App\News','idSubcategory','id');
    }
}
