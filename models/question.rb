require 'mongoid'

class Question
  include Mongoid::Document

  belongs_to :survey

  field :created_on, :type => Bignum
  field :type, :type => String
  field :label, :type => String
  field :options, :type => Array, :default => []

end