require 'mongoid'

class Visitorgroup
  include Mongoid::Document

  belongs_to :sessionob

  has_many :visitors
  field :visitors, :type => Array, :default => []

  field :comment, :type => String, :default => ''
  field :created_on, :type => Bignum
  field :consent, :type => Boolean, :default => true
end
