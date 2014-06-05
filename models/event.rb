require 'mongoid'

class Eventob
  include Mongoid::Document

  belongs_to :sessionob

  has_many :medias
  field :medias, :type => Array, :default => []

  has_many :interactions
  field :interactions, :type => Array, :default => []

  field :created_on, :type => Bignum
  field :finished_on, :type => Bignum
  field :comment, :type => String
  field :label, :type => String
  field :xpos, :type => Integer, :default => 0
  field :ypos, :type => Integer, :default => 0
end
