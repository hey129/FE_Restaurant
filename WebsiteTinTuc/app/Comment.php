<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $table = "Comment";
    
    public function News(){
        return $this->belongsTo('App\News','idNews','id');
    }
    public function users(){
        return $this->belongsTo('App\User','idUser','id');
    }
}
