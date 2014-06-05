require 'mongoid'

class Survey
  include Mongoid::Document

  belongs_to :space

  has_many :questions
  field :questions, :type => Array, :default => []
  field :answers, :type => Array, :default => []
  field :label, :type => String
  field :created_on, :type => Bignum
  field :locked, :type => Boolean, :default => false
end
